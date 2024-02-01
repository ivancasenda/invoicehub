package com.app.invoice.data;

import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

import com.app.invoice.Invoice;

public interface InvoiceRepository extends CrudRepository<Invoice, Long> {
	public Optional<Invoice> findByInvoiceID(String invoiceID);
}
