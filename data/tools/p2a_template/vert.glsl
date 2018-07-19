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

	P2 = P1.xyz;
	N2 = N1.xyz;
	if (obj_type < 1.0)
		mat_model_view = mat_view * rotationFromQuat(head_rotation_quat) * mat_model;

	gl_Position=mat_model_view*vec4(P2.x, P2.y, -P2.z, 1.0);
	gl_Position.z-=depth_hack;
	gl_Position=mat_proj*gl_Position;
	V_frag=normalize((mat_model_view*vec4(P2.x, P2.y, -P2.z, 1.0)).xyz);
	N_frag=normalize((mat_model_view*vec4(N2.x, N2.y, -N2.z, 0.0)).xyz);
	st_frag=st;

}
