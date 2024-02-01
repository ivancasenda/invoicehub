package com.app.invoice.service;

import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.app.invoice.Invoice;
import com.app.invoice.Item;
import com.app.invoice.exception.InvoicePrintErrorException;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JRParameter;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

@Slf4j
@Service
public class ReportService {

    private static final String INVOICE_TEMPLATE = "invoice.jrxml";

    /**
     * Export invoice to pdf and save in C:\Users\nicho\Desktop\Invoice.pdf
     * 
     * @param invoice
     * @param withTitle boolean whether to include title.
     */
    public byte[] exportReport(Invoice invoice) {
        JasperPrint jasperPrint = getJasperPrint(invoice);

        try {
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (Exception e) {
            log.error(e.getMessage());

            throw new InvoicePrintErrorException("Error in exporting pdf.");
        }
    }

    /**
     * Fill jasper report template with invoice data
     * report template used based on @withTitle and @printer parameters.
     * 
     * @param invoice
     * @return JasperPrint to be exported or print.
     */
    private JasperPrint getJasperPrint(Invoice invoice) {
        List<Item> items = invoice.getItems();

        // String templateFile = INVOICE_TEMPLATE;

        InputStream jrInvoiceFile;
        try {
            // jrInvoiceFile = ResourceUtils.getFile(templateFile);
            jrInvoiceFile = new ClassPathResource(INVOICE_TEMPLATE).getInputStream();
        } catch (IOException e) {
            log.error(e.getMessage());

            throw new InvoicePrintErrorException("Report template not found");
        }

        JasperReport jasperReport;
        try {
            jasperReport = JasperCompileManager.compileReport(jrInvoiceFile);
        } catch (JRException e) {
            log.error(e.getMessage());

            throw new InvoicePrintErrorException("Error occured while making report.");
        }

        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(items);

        Map<String, Object> reportParameters = new HashMap<>();
        Locale indonesiaLocale = new Locale("id", "ID");
        reportParameters.put(JRParameter.REPORT_LOCALE, indonesiaLocale);
        reportParameters.put("datetime", invoice.getDatetime().plusHours(7)
                .format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm").localizedBy(indonesiaLocale)));
        reportParameters.put("storeName", invoice.getStoreName());
        reportParameters.put("invoiceNote", invoice.getInvoiceNote());
        reportParameters.put("invoiceID", invoice.getInvoiceID().toUpperCase());

        JasperPrint jasperPrint;
        try {
            jasperPrint = JasperFillManager.fillReport(jasperReport, reportParameters, dataSource);
        } catch (JRException e) {
            log.error(e.getMessage());

            throw new InvoicePrintErrorException("Error in filling report.");
        }

        return jasperPrint;
    }
}
