vec4 shader_main() {
	vec2 tc = transposed > 0.0 ? st.yx : st;
	float tcx = 0.0, tcy = 1.0 - tc.y;
	if(flipx > 0.0) {
		tcx = tc.x;
	}
	else {
		tcx = 1.0 - tc.x;
	}
	if(mode > 2.5) { //3
		float new_img_w = img_w * img_scale;
		float new_img_h = img_h * img_scale;
		float x = (tcx * screen_w - floor(tcx * screen_w / new_img_w) * new_img_w) / new_img_w;
		float y = (tcy * screen_h - floor(tcy * screen_h / new_img_h) * new_img_h) / new_img_h;
		return texture2D(tex_bg, vec2(x, y));
	}
	
	else if(mode > 1.5) { //2
		float x = w_min + tcx * (w_max - w_min);
		float y = h_min + tcy * (h_max - h_min);
		return texture2D(tex_bg, vec2(x, y));
	}
	else if(mode > 0.5) { //1
		float w_scale = screen_w / img_w;
		float h_scale = screen_h / img_h;
		float scale = w_scale > h_scale ? w_scale : h_scale;
		float w = img_w * scale;
		float h = img_h * scale;
		float temp_w = (w - screen_w) / 2.0;
		float temp_h = (h - screen_h) / 2.0;
		float scale_w_min = temp_w / w;
		float scale_w_max = (w - temp_w) / w;
		float scale_h_min = temp_h / h;
		float scale_h_max = (h - temp_h) / h;
		float x = scale_w_min + tcx * (scale_w_max - scale_w_min);
		float y = scale_h_min + tcy * (scale_h_max - scale_h_min);
		return texture2D(tex_bg, vec2(x, y));
	}
	else { //0
		return texture2D(tex_bg, vec2(tcx, tcy));
	}
	
}
