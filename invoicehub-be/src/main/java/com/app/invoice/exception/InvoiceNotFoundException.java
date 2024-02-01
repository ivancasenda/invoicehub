package com.app.invoice.exception;

public class InvoiceNotFoundException extends RuntimeException {

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    public InvoiceNotFoundException(String message) {
        super(message);
    }

    public InvoiceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
