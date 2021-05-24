package com.crivano.swaggerservlet.ui;

import com.crivano.swaggerservlet.ISwaggerMethod;
import com.crivano.swaggerservlet.ISwaggerModel;
import com.crivano.swaggerservlet.ISwaggerRequest;
import com.crivano.swaggerservlet.ISwaggerResponse;

public interface ISwaggerServletUI {
	public class Error implements ISwaggerModel {
		public String error;
	}

	public interface IConvertPost extends ISwaggerMethod {
		public static class Request implements ISwaggerRequest {
			public String yaml;
		}

		public static class Response implements ISwaggerResponse {
			public String java;
		}

		public void run(Request req, Response resp, SwaggerServletUIContext ctx) throws Exception;
	}

}