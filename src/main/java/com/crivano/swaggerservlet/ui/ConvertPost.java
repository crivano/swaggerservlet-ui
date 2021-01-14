package com.crivano.swaggerservlet.ui;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import com.crivano.swaggerservlet.Swagger;
import com.crivano.swaggerservlet.SwaggerUtils;
import com.crivano.swaggerservlet.ui.ISwaggerServletUI.ConvertPostRequest;
import com.crivano.swaggerservlet.ui.ISwaggerServletUI.ConvertPostResponse;
import com.crivano.swaggerservlet.ui.ISwaggerServletUI.IConvertPost;

public class ConvertPost implements IConvertPost {

	public void run(ConvertPostRequest req, ConvertPostResponse resp) throws Exception {
		try {
			InputStream stream = new ByteArrayInputStream(req.yaml.getBytes(StandardCharsets.UTF_8));
			Swagger sv = new Swagger();
			sv.loadFromInputStream(stream);
			resp.java = sv.create(false);
		} catch (Exception ex) {
			resp.java = SwaggerUtils.stackAsString(ex);
		}
	}

	public String getContext() {
		return "convert swagger.yaml to java interface";
	}
}
