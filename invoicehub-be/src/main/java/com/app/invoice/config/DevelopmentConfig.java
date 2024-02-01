package com.app.invoice.config;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import com.app.invoice.Invoice;
import com.app.invoice.InvoiceSystem;
import com.app.invoice.Item;
import com.app.invoice.data.InvoiceRepository;
import com.app.invoice.data.InvoiceSystemRepository;

import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.Search;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

@Profile("dev")
@Configuration
public class DevelopmentConfig {

	@PersistenceContext
	EntityManager entityManager;

	/**
	 * Initialize database for testing, start invoice_id sequence 1, and insert data
	 * to database
	 * 
	 * @param invoiceRepo       Injected InvoiceRepository
	 * @param invoiceSystemRepo Injected InvoiceSystemRepo
	 * @return
	 */
	@Bean
	public CommandLineRunner testDataAndIndex(InvoiceRepository invoiceRepo,
			InvoiceSystemRepository invoiceSystemRepo) {

		return new CommandLineRunner() {

			@Override
			@Transactional
			public void run(String... args) throws Exception {
				InvoiceSystem invoiceSystem = new InvoiceSystem();
				invoiceSystem.setName("LATEST_INVOICE_ID_SEQUENCE");
				invoiceSystem.setValue("127");

				invoiceSystemRepo.save(invoiceSystem);

				for (int x = 1; x < 127; x++) {
					Item item1 = new Item(2.00, "PCS", "Product Name 1", 50000.0);
					Item item2 = new Item(3.00, "PCS", "Product Name 2", 10000.00);
					List<Item> items = new ArrayList<Item>();
					for (int i = 0; i < 1; i++) {
						items.add(item1);
					}
					items.add(item2);

					Invoice newInvoice = new Invoice("INV-" + x, LocalDateTime.now(ZoneOffset.UTC), "Name " + x,
							"Note", items);

					invoiceRepo.save(newInvoice);
				}

				FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);
				fullTextEntityManager.createIndexer().startAndWait();

			}
		};

	}
}
