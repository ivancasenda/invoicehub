package com.app.invoice.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.app.invoice.Invoice;
import com.app.invoice.InvoiceSystem;
import com.app.invoice.data.InvoiceRepository;
import com.app.invoice.data.InvoiceSystemRepository;
import com.app.invoice.exception.InvoiceNotFoundException;
import com.app.invoice.exception.InvoiceNotUniqueException;
import com.app.invoice.service.ReportService;
import com.app.invoice.service.SearchService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

/**
 * Invoice Api with available GET, PUT, POST, DELETE.
 */
@Slf4j
@RestController
@RequestMapping("/invoice")
public class InvoiceRestController {
	// default invoice prefix for auto generated invoice id.
	private static final String INVOICE_ID_PREFIX = "inv";

	private final InvoiceRepository invoiceRepo;
	private final InvoiceSystemRepository invoiceSystemRepo;
	private final ReportService reportService;
	private final SearchService searchService;

	/**
	 * Construct and inject services.
	 * 
	 * @param invoiceRepo       Repository of invoices.
	 * @param invoiceSystemRepo Repository of containing latest invoice id sequnce.
	 * @param reportService     Report Service to print invoice.
	 * @param searchService     Search Service to perform searches on invoice in the
	 *                          database.
	 */
	@Autowired
	public InvoiceRestController(
			InvoiceRepository invoiceRepo,
			InvoiceSystemRepository invoiceSystemRepo,
			ReportService reportService,
			SearchService searchService) {

		this.invoiceRepo = invoiceRepo;
		this.invoiceSystemRepo = invoiceSystemRepo;
		this.reportService = reportService;
		this.searchService = searchService;
	}

	/**
	 * Generate invoice id with default prefix and latest sequence.
	 */
	@GetMapping("/generate-invoice-id")
	public Map<String, String> generateInvoiceID() {
		final String latestSequence = invoiceSystemRepo.findByName(InvoiceSystem.INVOICE_SYSTEM_SEQUENCE_NAME)
				.getValue();
		String invoiceID = INVOICE_ID_PREFIX + '-' + latestSequence;

		HashMap<String, String> map = new HashMap<>();
		map.put("newInvoiceID", invoiceID);
		return map;
	}

	/**
	 * Check if invoice id available.
	 * 
	 * @param invoiceID invoice id to be check.
	 * @return false if invoice id has been used or invoice id sequence bigger than
	 *         the last save sequence
	 *         else return true.
	 */
	@GetMapping("/available/{invoiceID}")
	public boolean isInvoiceIdAvaliable(@PathVariable String invoiceID) {
		invoiceID = invoiceID.toLowerCase();
		String invoiceIdPrefix = InvoiceRestController.extractInvoiceIdPrefix(invoiceID);
		Long invoiceIdSequence = Long.parseLong(extractInvoiceIdSequence(invoiceID));
		Long latestSequence = Long
				.parseLong(invoiceSystemRepo.findByName(InvoiceSystem.INVOICE_SYSTEM_SEQUENCE_NAME).getValue());

		if (invoiceIdPrefix.equals(INVOICE_ID_PREFIX) && invoiceIdSequence > latestSequence)
			return false;

		Optional<Invoice> foundInvoice = invoiceRepo.findByInvoiceID(invoiceID);
		if (foundInvoice.isEmpty())
			return true;
		return false;
	}

	/**
	 * Get invoice based on id.
	 * 
	 * @param id hibernate auto generated id.
	 * @return Invoice with specified id.
	 * @throws InvoiceNotFoundException if Invoice with specified id not found.
	 */
	@GetMapping("/{id}")
	public Invoice showInvoice(@PathVariable Long id) {
		Optional<Invoice> foundInvoice = invoiceRepo.findById(id);
		if (foundInvoice.isEmpty())
			throw new InvoiceNotFoundException("Invoice with this id does not exist or has been deleted");
		return foundInvoice.get();
	}

	/**
	 * Save new Invoice to the database.
	 * 
	 * @param invoice Invoice object to be saved.
	 * @return saved Invoice filled with hibernate auto generated id and invoice id
	 *         lowercased.
	 * @throws InvoiceNotUniqueException if Invoice with the same invoice_id found.
	 */
	@PostMapping()
	public Invoice saveInvoice(@RequestBody Invoice invoice) {
		if (!isInvoiceIdAvaliable(invoice.getInvoiceID()))
			throw new InvoiceNotUniqueException(
					"Invoice number has been used or Invoice number bigger that last sequence");

		String invoiceID = invoice.getInvoiceID();

		checkAndUpdateInvoiceIdSequence(invoiceID);

		invoice.setInvoiceID(invoiceID.toLowerCase());
		return invoiceRepo.save(invoice);
	}

	/**
	 * Update Invoice in the database, lowercase invoice id.
	 * 
	 * @param invoice spring converted Invoice object from JSON to be updated.
	 * @throws InvoiceNotFoundException if trying to update previously unsaved
	 *                                  Invoice.
	 */
	@PutMapping("/{id}")
	public void updateInvoice(@RequestBody Invoice invoice) {
		if (invoiceRepo.findById(invoice.getId()).isEmpty())
			throw new InvoiceNotFoundException("Cannot update invoice, invoice doesn't exist");

		String invoiceID = invoice.getInvoiceID();

		checkAndUpdateInvoiceIdSequence(invoiceID);

		invoice.setInvoiceID(invoiceID.toLowerCase());
		invoiceRepo.save(invoice);
	}

	/**
	 * Delete Invoice with specified id.
	 * 
	 * @param id hibernate auto generated id.
	 * @throws InvoiceNotFoundException if trying to delete previously unsaved
	 *                                  Invoice.
	 */
	@DeleteMapping("/{id}")
	public void deleteInvoice(@PathVariable Long id) {
		try {
			invoiceRepo.deleteById(id);

			log.info("Invoice with id " + id + " deleted");
		} catch (EmptyResultDataAccessException e) {
			log.error("Exception thrown while trying to delete Invoice with id " + id);

			throw new InvoiceNotFoundException("Cannot delete invoice, invoice with this id doesn't exist");
		}
	}

	/**
	 * Search saved invoice in the database with multiple parameters.
	 * 
	 * @param resultSize   set maximum number of invoices return.
	 * @param firstRow     set begining index from search result list.
	 * @param globalFilter optional keyword to be search on invoice id or store name
	 *                     field.
	 * @param invoiceID    optional invoice id to be search.
	 * @param storeName    optional store name to be search.
	 * @param datetimeFrom optional, specify date and time return Invoices must be
	 *                     above or equals.
	 * @param datetimeTo   optional, specify date and time return Invoices must be
	 *                     below or equals.
	 * @param sortField    optional field to be sorted. valid field = invoiceID,
	 *                     storeName, datetime.
	 * @param sortOrder    order to sorted. 0 = relevance, 1 = descending, 2 =
	 *                     ascending.
	 * @return List of Invoices that match search parameters.
	 */
	@GetMapping("/search")
	public List<Invoice> searchInvoice(@RequestParam int resultSize, @RequestParam int firstRow,
			@RequestParam(required = false) String globalFilter, @RequestParam(required = false) String invoiceID,
			@RequestParam(required = false) String storeName,
			@RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime datetimeFrom,
			@RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime datetimeTo,
			@RequestParam(required = false) String sortField, int sortOrder) {

		return searchService.search(resultSize, firstRow, globalFilter, invoiceID, storeName, datetimeFrom, datetimeTo,
				sortField, sortOrder);
	}

	/**
	 * Get total invoices found based on search parameters.
	 * 
	 * @param globalFilter optional keyword to be search on invoice id or store name
	 *                     field.
	 * @param invoiceID    optional invoice id to be search.
	 * @param storeName    optional store name to be search.
	 * @param datetimeFrom optional, specify date and time return Invoices must be
	 *                     above.
	 * @param datetimeTo   optional, specify date and time return Invoices must be
	 *                     below.
	 * @return number of invoices found.
	 */
	@GetMapping("/search-found")
	public int totalSearchInvoice(@RequestParam(required = false) String globalFilter,
			@RequestParam(required = false) String invoiceID, @RequestParam(required = false) String storeName,
			@RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime datetimeFrom,
			@RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE_TIME) LocalDateTime datetimeTo) {

		return searchService.totalSearch(globalFilter, invoiceID, storeName, datetimeFrom, datetimeTo);
	}

	/**
	 * Print invoice with specified printer.
	 * 
	 * @param invoice Invoice to be printed.
	 */
	@PostMapping("/print")
	public @ResponseBody byte[] printInvoice(@RequestBody Invoice invoice) {
		byte[] pdf = reportService.exportReport(invoice);
		return pdf;
	}

	/**
	 * Increment invoice id sequence in InvoiceSystemRepository
	 * if @invoiceID prefix start with 'inv' and @invoiceID sequence equals to the
	 * last sequence in InvoiceSystemRepository.
	 * 
	 * @param invoiceID invoice id to be check.
	 */
	private void checkAndUpdateInvoiceIdSequence(String invoiceID) {
		InvoiceSystem sequenceSystem = invoiceSystemRepo.findByName(InvoiceSystem.INVOICE_SYSTEM_SEQUENCE_NAME);

		String invoiceIdPrefix = extractInvoiceIdPrefix(invoiceID);

		Long invoiceIdSequence = Long.parseLong(extractInvoiceIdSequence(invoiceID));

		Long latestSequence = Long.parseLong(sequenceSystem.getValue());

		if (invoiceIdPrefix.equals(INVOICE_ID_PREFIX) && invoiceIdSequence.equals(latestSequence)) {
			Long nextSequence = latestSequence + 1;

			sequenceSystem.setValue(nextSequence.toString());
			invoiceSystemRepo.save(sequenceSystem);
		}
	}

	/**
	 * Extract prefix from invoice id parameter.
	 * 
	 * @param invoiceID
	 * @return the prefix from invoice id parameter.
	 */
	private static String extractInvoiceIdPrefix(String invoiceID) {
		return invoiceID.split("-")[0];
	}

	/**
	 * Extract sequence from invoice id parameter.
	 * 
	 * @param invoiceID
	 * @return the sequence from invoice id parameter.
	 */
	private static String extractInvoiceIdSequence(String invoiceID) {
		return invoiceID.split("-")[1];
	}
}