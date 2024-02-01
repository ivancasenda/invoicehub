package com.app.invoice.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiException {

    private final String summary;
    private final String detail;
    private final LocalDateTime timestamp;

}
