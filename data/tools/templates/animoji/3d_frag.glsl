varying vec3 N_frag;
varying vec2 st_frag;
varying vec3 V_frag;

float sqr(float a){return a*a;}
vec3 sqr(vec3 a){return a*a;}
vec4 sqr(vec4 a){return vec4(sqr(a.rgb), a.a);}

vec4 shader_main(){
	vec3 N=-normalize(N_frag);

	vec3 C_diff=vec3(0.0);
	vec3 L = vec3(0.0);
	vec3 V=-normalize(V_frag);

	L=-L0_dir;C_diff+=max(dot(N,L),0.0)*L0_color;
	L=-L1_dir;C_diff+=max(dot(N,L),0.0)*L1_color; 
	vec4 C_tex=texture2D(tex_albedo,st_frag);
	
	vec3 amb = vec3(Ka);
	vec3 diff = C_diff * Kd;
	
	vec3 R = normalize(reflect(L0_dir, N));
	float dotVR = max(dot(V, R), 0.0);
	vec3 spec = vec3(Ks) * pow(dotVR, 16.0);
	
	return vec4(C_tex.rgb * (amb + diff) + spec, C_tex.w);
}
