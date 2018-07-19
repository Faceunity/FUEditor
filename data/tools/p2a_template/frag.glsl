varying vec3 N_frag,V_frag;
varying vec2 st_frag;
varying vec3 model_pos;

float sqr(float a){return a*a;}
vec3 sqr(vec3 a){return a*a;}
vec4 sqr(vec4 a){return vec4(sqr(a.rgb),a.a);}
float selfDot(vec3 v){return v.x * v.x + v.y * v.y + v.z * v.z;}

vec4 shader_main(){

	vec3 N=normalize(N_frag);
	vec3 C_diff=vec3(0.0,0.0,0.0);
	float C_spec=0.0;
	vec3 V=-normalize(V_frag),L;

	N=-N;

	const float c1 = 0.429043, c2 = 0.511664, c3 = 0.743125, c4 = 0.886227, c5 = 0.247708;
	C_diff = c1*l22*(N.x*N.x-N.y*N.y) 
		+ c3*l20*N.z*N.z + c4*l00 - c5*l20
		+ 2.0*c1*(l2_2*N.x*N.y+l21*N.x*N.z+l2_1*N.y*N.z)
		+ 2.0*c1*(l11*N.x+l1_1*N.y+l10*N.z);
	L=normalize(model_pos-vec3(0.0,0.0,lz*1.1511));C_diff+=max(dot(N,L),0.0)*L0_color;C_spec+=sqr(max(dot(reflect(L,N),-V),0.0));
	L=normalize(model_pos-vec3(lz*0.767,ly,lz));C_diff+=max(dot(N,L),0.0)*L1_color;C_spec+=sqr(max(dot(reflect(L,N),-V),0.0));
	L=normalize(model_pos-vec3(-lz*0.767,ly,lz));C_diff+=max(dot(N,L),0.0)*L1_color;C_spec+=sqr(max(dot(reflect(L,N),-V),0.0));

	vec4 C_tex = sqr(texture2D(tex_albedo,st_frag));

	return vec4(sqrt((C_diff*Kd+vec3(Ka))*C_tex.rgb+vec3(Ks)*(C_spec)),C_tex.a);

}
