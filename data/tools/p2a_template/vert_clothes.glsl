varying vec3 N_frag,V_frag;
varying vec2 st_frag;
varying vec3 model_pos;

void main(){

	vec4 P1=tfm_before * vec4(P*inv_quantize, 1.0);
	vec4 N1=vec4(N, 0.0);
	vec3 P2=vec3(0.0);
	vec3 N2=vec3(0.0);
	model_pos=P;
	mat4 mat_model_view = mat_view * mat_model;

	if (animating == 1.0) {
		vec4 row[3];
		// Do not Use SKEL0[i] directly in texture2DLod. Because it triggers an error on Meizu MX5.
		vec4 skel_id = SKEL0;
		vec4 skel_weight = WEIGHT0;
		for (int i = 0; i < 4; i++) {
			for(int j = 0; j < 3; j++) {
				row[j] = texture2DLod(tex_deform, vec2((3.0 * fid + float(j) + 0.5) / deform_width, skel_id[i]), 0.0);
			}
			P2 += skel_weight[i] * vec3(dot(P1, row[0]), dot(P1, row[1]), dot(P1, row[2]));
			N2 += skel_weight[i] * vec3(dot(N1, row[0]), dot(N1, row[1]), dot(N1, row[2]));
		}
		skel_id = SKEL1;
		skel_weight = WEIGHT1;
		for (int i = 0; i < 4; i++) {
			for(int j = 0; j < 3; j++) {
				row[j] = texture2DLod(tex_deform, vec2((3.0 * fid + float(j) + 0.5) / deform_width, skel_id[i]), 0.0);
			}
			P2 += skel_weight[i] * vec3(dot(P1, row[0]), dot(P1, row[1]), dot(P1, row[2]));
			N2 += skel_weight[i] * vec3(dot(N1, row[0]), dot(N1, row[1]), dot(N1, row[2]));
		}
	} else {
		P2 = P1.xyz;
		N2 = N1.xyz;
	}

	gl_Position=mat_model_view*vec4(P2.x, P2.y, -P2.z, 1.0);
	gl_Position.z-=depth_hack;
	gl_Position=mat_proj*gl_Position;
	V_frag=normalize((mat_model_view*vec4(P2.x, P2.y, -P2.z, 1.0)).xyz);
	N_frag=normalize((mat_model_view*vec4(N2.x, N2.y, -N2.z, 0.0)).xyz);
	st_frag=st;

}
