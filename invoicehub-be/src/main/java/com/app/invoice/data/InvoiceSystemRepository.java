package com.app.invoice.data;

import com.app.invoice.InvoiceSystem;

import org.springframework.data.repository.CrudRepository;

public interface InvoiceSystemRepository extends CrudRepository<InvoiceSystem, Long> {

    public InvoiceSystem findByName(String name);

}
