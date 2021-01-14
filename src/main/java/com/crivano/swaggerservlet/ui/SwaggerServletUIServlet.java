package com.crivano.swaggerservlet.ui;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;

import com.crivano.swaggerservlet.SwaggerServlet;

public class SwaggerServletUIServlet extends SwaggerServlet {
	private static final long serialVersionUID = -1611417120964698257L;

	@Override
	public void initialize(ServletConfig config) throws ServletException {
		super.setAPI(ISwaggerServletUI.class);
		super.setActionPackage("com.crivano.swaggerservlet.ui");
	}
}
