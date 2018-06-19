varying vec3 N_frag,dPds_frag,dPdt_frag;
varying vec2 st_frag;
varying vec3 V_frag;

float selfDot(vec3 v){
	return v.x * v.x + v.y * v.y + v.z * v.z;
}

float sqr(float a){return a*a;}
vec3 sqr(vec3 a){return a*a;}
vec4 sqr(vec4 a){return vec4(sqr(a.rgb), a.a);}


vec4 shader_main(){
	vec3 N=-normalize(N_frag);
	if (selfDot(dPds_frag) > 0.0 && selfDot(dPdt_frag) > 0.0 && normal_strength > 0.0){
		vec3 nmmp=normalize(texture2D(tex_normal,st_frag).xyz-vec3(0.5));
		N+=(normalize(-nmmp.x*normalize(dPds_frag)-nmmp.y*normalize(dPdt_frag)+nmmp.z*N)-N)*normal_strength;
		N=normalize(N);	
	}
	
	vec3 V=-normalize(V_frag);
	float dotNV=dot(N,V);
	if(dotNV<0.0){
		if(is_hair>0.5){
			N=-N;
			dotNV=-dotNV;
		}else{
			dotNV=0.0;
		}
	}
	
	vec3 C_diff=vec3(0.0,0.0,0.0);

	vec3 L;

	L=-L0_dir;C_diff+=max(dot(N,L),0.0)*L0_color; 
	L=-L1_dir;C_diff+=max(dot(N,L),0.0)*L1_color; 
	//L=-L2_dir;C_diff+=max(dot(N,L),0.0)*L2_color; 

	vec4 C_tex=sqr(texture2D(tex_albedo,st_frag));
	vec3 C_brdf=(C_diff*diffuse+vec3(ambient_color))*C_tex.xyz + vec3(incandescence);

	return vec4(sqrt(C_brdf),C_tex.w);
}
