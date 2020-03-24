/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018-2020 AT&T Intellectual Property. All rights reserved.
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

package org.onap.appc.cdt.service.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.UnknownHostException;
import java.util.Base64;
import java.util.List;

/**
 * Created by Amaresh Kumar on 09/May/2018.
 */

@RestController
@RequestMapping("/cdtService")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Api(value = "cdtService", description = "Backend service to eliminate CORS issue for CDT Tool")
public class CdtController {

    private static final Logger logger = LoggerFactory.getLogger(CdtController.class);
    private RestTemplate restTemplate = new RestTemplate();
    private String urlAddress;

    @Value("${restConf.backend.hostname}")
    private String restConfHostname;

    @Value("${restConf.backend.port}")
    private String restConfPort;


    @ApiOperation(value = "Return All Test Data for a given user", response = CdtController.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "OK"),
            @ApiResponse(code = 404, message = "The resource not found")
    })
    @RequestMapping(value = "", method = RequestMethod.GET)
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public String DefaultEndpoint()  {
        return  "CDT Proxy Service is up and running.";

    }

    @ApiOperation(value = "Return All Test Data for a given user", response = CdtController.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "OK"),
            @ApiResponse(code = 404, message = "The resource not found")
    })
    @RequestMapping(value = "/getDesigns", method = RequestMethod.POST)
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public String getDesigns(@RequestBody String getDesignsRequest, @RequestHeader HttpHeaders requestHeader) throws UnknownHostException {
        HttpEntity<String> entity = getStringHttpEntity(getDesignsRequest, requestHeader);
        HttpClient httpClient = HttpClientBuilder.create().build();
        ClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
        restTemplate.setRequestFactory(factory);
        String getDesignsResponse = restTemplate.postForObject(getUrl("getDesigns"), entity, String.class);
        return getDesignsResponse;
    }

    @ApiOperation(value = "Test VNF", response = CdtController.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "OK"),
            @ApiResponse(code = 404, message = "The resource not found")
    })
    @RequestMapping(value = "/testVnf", method = RequestMethod.POST)
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public String testVnf(@RequestParam String urlAction, @RequestBody String testVnf, @RequestHeader HttpHeaders requestHeader) throws UnknownHostException {
        HttpEntity<String> entity = getStringHttpEntity(testVnf, requestHeader);
        String testVnfResponse = restTemplate.postForObject(getUrl("testVnf")+urlAction, entity, String.class);
        return testVnfResponse;
    }

    @ApiOperation(value = "Check status of submitted Test", response = CdtController.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "OK"),
            @ApiResponse(code = 404, message = "The resource not found")
    })
    @RequestMapping(value = "/checkTestStatus", method = RequestMethod.POST)
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public String checkTestStatus(@RequestBody String checkTestStatusRequest, @RequestHeader HttpHeaders requestHeader) throws UnknownHostException {
        HttpEntity<String> entity = getStringHttpEntity(checkTestStatusRequest, requestHeader);
        String checkTestStatusResponse = restTemplate.postForObject(getUrl("checkTestStatus"), entity, String.class);
        return checkTestStatusResponse;
    }

    @ApiOperation(value = "Validate a template which is being uploaded", response = CdtController.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "OK"),
            @ApiResponse(code = 404, message = "The resource not found")
    })
    @RequestMapping(value = "/validateTemplate", method = RequestMethod.POST)
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public String validateTemplate(@RequestBody String validateTemplateRequest, @RequestHeader HttpHeaders requestHeader) throws UnknownHostException {
        HttpEntity<String> entity = getStringHttpEntity(validateTemplateRequest, requestHeader);
        String validateTemplateResponse = restTemplate.postForObject(getUrl("validateTemplate"), entity, String.class);
        return validateTemplateResponse;
    }

    private HttpEntity<String> getStringHttpEntity(@RequestBody String getDesignsRequest, @RequestHeader HttpHeaders requestHeader) {

        HttpHeaders headers = new HttpHeaders();
        if(requestHeader.containsKey("authorization")) {
          List<String> headerAuthValue = requestHeader.get("authorization");
          if(headerAuthValue != null && headerAuthValue.size() > 0) {
              headers.set("authorization", headerAuthValue.get(0));
          }
      }
        headers.setAccessControlAllowCredentials(true);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<String>(getDesignsRequest, headers);
    }

    private String getUrl(String ApiName) throws UnknownHostException {

        switch (ApiName) {
            case "getDesigns":
                urlAddress = "http://" + restConfHostname + ":" + restConfPort + "/restconf/operations/design-services:dbservice";
                break;
            case "testVnf":
                urlAddress = "http://" + restConfHostname + ":" + restConfPort + "/restconf/operations/appc-provider-lcm:";
                break;
            case "checkTestStatus":
                urlAddress = "http://" + restConfHostname + ":" + restConfPort + "/restconf/operations/appc-provider-lcm:action-status";
                break;
            case "validateTemplate":
                urlAddress = "http://" + restConfHostname + ":" + restConfPort + "/restconf/operations/design-services:validator";
                break;
            default:
                logger.error("URI not resolved because Api call not supported ");
        }
        logger.info("Calling Endpoint..... " + urlAddress);
        return urlAddress;
    }
}
