package com.app.invoice.exception;

public class InvoicePrintErrorException extends RuntimeException {

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    public InvoicePrintErrorException(String message) {
        super(message);
    }

    public InvoicePrintErrorException(String message, Throwable cause) {
        super(message, cause);
    }

}
