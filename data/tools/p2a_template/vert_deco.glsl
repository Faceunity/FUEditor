varying vec3 N_frag,V_frag;
varying vec2 st_frag;
varying vec3 model_pos;

mat4 rotationFromQuat(vec4 q){
	float xy = q.x * q.y;
	float yz = q.y * q.z;
	float zx = q.z * q.x;
	float x2 = q.x * q.x;
	float y2 = q.y * q.y;
	float z2 = q.z * q.z;
	float xw = q.x * q.w;
	float yw = q.y * q.w;
	float zw = q.z * q.w;
	return mat4(
		1.0-2.0*(y2+z2),2.0*(xy-zw),2.0*(zx+yw),0.0,
		2.0*(xy+zw),1.0-2.0*(x2+z2),2.0*(yz-xw),0.0,
		2.0*(zx-yw),2.0*(yz+xw),1.0-2.0*(x2+y2),0.0,
		0.0,0.0,0.0,1.0);
}

void main(){

	vec4 P1=tfm_before * vec4(P*inv_quantize, 1.0);
	vec4 N1=vec4(N, 0.0);
	vec3 P2=vec3(0.0);
	vec3 N2=vec3(0.0);
	model_pos=P;
	mat4 mat_model_view = mat_view * mat_model;

	if (animating == 1.0) {
		if (anim_head == 0.0) {
			P1 = inverse_mat_model * rotationFromQuat(head_rotation_quat) * mat_model * vec4(P1.x, P1.y, -P1.z, 1.0);
			P1.z = -P1.z;
			P1.w = 1.0;
		}
		float skel_id = 15.0 / 64.0;
		vec4 row[3];
		for (int i = 0; i < 3; i++) {
			row[i] = texture2DLod(tex_deform, vec2((3.0 * fid + float(i) + 0.5) / deform_width, skel_id), 0.0);
		}
		P2 += vec3(dot(P1, row[0]), dot(P1, row[1]), dot(P1, row[2]));
		N2 += vec3(dot(N1, row[0]), dot(N1, row[1]), dot(N1, row[2]));
	} else {
		P2 = P1.xyz;
		N2 = N1.xyz;
		mat_model_view = mat_view * rotationFromQuat(head_rotation_quat) * mat_model;
	}

	hairShading_frag = hairShading.xyz;

	gl_Position=mat_model_view*vec4(P2.x, P2.y, -P2.z, 1.0);
	gl_Position.z-=depth_hack;
	gl_Position=mat_proj*gl_Position;
	V_frag=normalize((mat_model_view*vec4(P2.x, P2.y, -P2.z, 1.0)).xyz);
	N_frag=normalize((mat_model_view*vec4(N2.x, N2.y, -N2.z, 0.0)).xyz);
	st_frag=st;

}
