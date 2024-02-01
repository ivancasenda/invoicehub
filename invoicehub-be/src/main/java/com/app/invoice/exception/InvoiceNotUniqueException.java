package com.app.invoice.exception;

public class InvoiceNotUniqueException extends RuntimeException {

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    public InvoiceNotUniqueException(String message) {
        super(message);
    }

    public InvoiceNotUniqueException(String message, Throwable cause) {
        super(message, cause);
    }
}
