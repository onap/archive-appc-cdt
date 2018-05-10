/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.
===================================================================

Unless otherwise specified, all software contained herein is licensed
under the Apache License, Version 2.0 (the License);
you may not use this software except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

============LICENSE_END============================================
*/
package org.onap.appc.cdt.service.exceptions;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.context.request.WebRequest;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.UnknownHostException;

/**
 * Created by Amaresh Kumar on 09/May/2018.
 */
@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UnknownHostException.class)
    public String handleSQLException(HttpServletRequest request, Exception ex) {
        logger.info("UnknownHostException Occured:: URL=" + request.getRequestURL());
        return "Host not found";
    }

    @ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "IOException occured")
    @ExceptionHandler(IOException.class)
    public void handleIOException() {
        logger.error("IOException handler executed");
    }

    @ResponseStatus(value = HttpStatus.GATEWAY_TIMEOUT, reason = "Cannot access restconf URl")
    @ExceptionHandler(ResourceAccessException.class)
    public void handleResourceAccessException() {
        logger.error("IOException handler executed");
    }

    @ExceptionHandler(value = {ResourceNotFoundException.class})
    protected ResponseEntity<Object> handleResourceNotFoundExceptionException(ResourceNotFoundException ex, WebRequest request) {
        StringBuilder builder = new StringBuilder();
        builder.append(ex.getMessage());
        ApiError apiError = new ApiError(HttpStatus.NOT_FOUND,
                "Resource Doesnt Exists.", builder.substring(0, builder.length()));
        return new ResponseEntity<Object>(apiError, new HttpHeaders(), apiError.getStatus());
    }

}
