package br.jus.trf2.trek.ui;

import com.crivano.swaggerservlet.ISwaggerMethod;
import com.crivano.swaggerservlet.ISwaggerModel;
import com.crivano.swaggerservlet.ISwaggerRequest;
import com.crivano.swaggerservlet.ISwaggerResponse;

public interface ITrekUI {
	public class Error implements ISwaggerModel {
		public String error;
	}

	public class ConvertPostRequest implements ISwaggerRequest {
		public String yaml;
	}

	public class ConvertPostResponse implements ISwaggerResponse {
		public String java;
	}

	public interface IConvertPost extends ISwaggerMethod {
		public void run(ConvertPostRequest req, ConvertPostResponse resp) throws Exception;
	}

}