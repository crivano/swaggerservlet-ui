package br.jus.trf2.trek.ui;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;

import com.crivano.swaggerservlet.SwaggerServlet;

public class TrekUIServlet extends SwaggerServlet {
	private static final long serialVersionUID = -1611417120964698257L;

	@Override
	public void init(ServletConfig config) throws ServletException {
		super.init(config);

		super.setAPI(ITrekUI.class);

		super.setActionPackage("br.jus.trf2.trek.ui");
	}
}
