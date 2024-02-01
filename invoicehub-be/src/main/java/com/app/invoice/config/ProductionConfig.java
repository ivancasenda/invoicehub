package com.app.invoice.config;

import com.app.invoice.InvoiceSystem;
import com.app.invoice.data.InvoiceSystemRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Profile("prod")
@Configuration
public class ProductionConfig {

    /**
     * Initialize database with invoice_id start sequence 1
     * 
     * @param invoiceSystemRepo Injected InvoiceSystemRepo
     * @return
     */
    @Bean
    public CommandLineRunner initializeInvoiceSystem(InvoiceSystemRepository invoiceSystemRepo) {
        return new CommandLineRunner() {

            @Override
            public void run(String... args) throws Exception {

                InvoiceSystem invoiceSystem = invoiceSystemRepo.findByName(InvoiceSystem.INVOICE_SYSTEM_SEQUENCE_NAME);

                if (invoiceSystem == null) {
                    invoiceSystem = new InvoiceSystem();
                    invoiceSystem.setName("LATEST_INVOICE_ID_SEQUENCE");
                    invoiceSystem.setValue("1");

                    invoiceSystemRepo.save(invoiceSystem);
                }
            }

        };
    }

}
