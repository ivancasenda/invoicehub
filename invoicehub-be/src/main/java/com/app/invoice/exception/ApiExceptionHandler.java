package com.app.invoice.exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler({ Exception.class })
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiException handleAllException(Exception e) {
        log.error(e.getMessage());

        ApiException apiException = new ApiException("Internal Error", "Please contact administrator",
                LocalDateTime.now());
        return apiException;
    }

    @ExceptionHandler(value = { InvoiceNotFoundException.class })
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public ApiException handleInvoiceNotFoundException(InvoiceNotFoundException e) {
        log.error(e.getMessage());

        ApiException apiException = new ApiException("Invoice not found", e.getMessage(), LocalDateTime.now());
        return apiException;
    }

    @ExceptionHandler(value = { InvoicePrintErrorException.class })
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiException handleInvoicePrintErrorException(InvoicePrintErrorException e) {
        log.error(e.getMessage());

        ApiException apiException = new ApiException("Print Error", e.getMessage(), LocalDateTime.now());
        return apiException;
    }

    @ExceptionHandler(value = { InvoiceNotUniqueException.class })
    @ResponseStatus(value = HttpStatus.CONFLICT)
    public ApiException handleInvoiceNotUniqueException(InvoiceNotUniqueException e) {
        log.error(e.getMessage());

        ApiException apiException = new ApiException("Invoice no invalid", e.getMessage(), LocalDateTime.now());
        return apiException;
    }

    @ExceptionHandler(value = { MethodArgumentTypeMismatchException.class })
    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    public ApiException handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
        log.error(e.getMessage());

        ApiException apiException = new ApiException("Request Error", "Error in request parameter",
                LocalDateTime.now());
        return apiException;
    }

}
