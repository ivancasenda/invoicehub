package com.app.invoice;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Data;

@Entity
@Data
public class InvoiceSystem {

    public static final String INVOICE_SYSTEM_SEQUENCE_NAME = "LATEST_INVOICE_ID_SEQUENCE";

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)
    private String name;

    private String value;

}
