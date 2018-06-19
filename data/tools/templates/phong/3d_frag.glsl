varying vec3 N_frag,dPds_frag,dPdt_frag;
varying vec2 st_frag;
varying vec3 V_frag;

float selfDot(vec3 v){
	return v.x * v.x + v.y * v.y + v.z * v.z;
}

float sqr(float a){return a*a;}
vec3 sqr(vec3 a){return a*a;}
vec4 sqr(vec4 a){return vec4(sqr(a.rgb), a.a);}

vec3 sampleEnv(vec3 R0){
	vec3 R=normalize(R0);
	float phi;
	if(abs(R.x)<abs(R.z)){
		phi=(3.1415926*0.5-atan(abs(R.x/R.z)));
	}else{
		phi= (abs(R.z/R.x));
	}
	if(R.x<0.0){
		if(R.z<0.0){
			phi=-(3.1415926-phi);
		}else{
			phi=3.1415926-phi;
		}
	}else{
		if(R.z<0.0){
			phi=-phi;
		}else{
			phi=phi;
		}
	}
	phi=phi*(0.5/3.1415926);
	float theta=asin(clamp(R.y,-0.99,0.99))*(1.0/3.1415926)+0.5;
	phi=phi*envmap_fov+envmap_shift;
	theta=theta*envmap_fov;
	phi-=floor(phi);theta-=floor(theta);
	return sqr(texture2D(tex_light_probe,vec2(phi,theta)).xyz)*4.0;
}

float fresnel(float c){
	float g=sqrt(max(ior*ior-1.0+c*c,0.0));
	return 0.5*sqr((g-c)/(g+c))*(1.0+sqr(c*(g+c)-1.0)/sqr(c*(g-c)+1.0));
}

vec4 shader_main(){
	vec3 N=-normalize(N_frag);
	if (selfDot(dPds_frag) > 0.0 && selfDot(dPdt_frag) > 0.0 && normal_strength > 0.0){
		vec3 nmmp=normalize(texture2D(tex_normal,st_frag).xyz-vec3(0.5));
		N+=(normalize(-nmmp.x*normalize(dPds_frag)-nmmp.y*normalize(dPdt_frag)+nmmp.z*N)-N)*normal_strength;
		N=normalize(N);	
	}
	vec3 C_diff=vec3(0.0,0.0,0.0);
	float C_spec=0.0;
	vec3 V=-normalize(V_frag),L;
	float dotNV=dot(N,V);
	vec3 R=V-2.0*dotNV*N;
	if(dotNV<0.0){
		if(is_hair>0.5){
			N=-N;
			dotNV=-dotNV;
		}else{
			dotNV=0.0;
		}
	}
	L=-L0_dir;C_diff+=max(dot(N,L),0.0)*L0_color; 
	L=-L1_dir;C_diff+=max(dot(N,L),0.0)*L1_color; 
	//L=-L2_dir;C_diff+=max(dot(N,L),0.0)*L2_color; 
	
	vec3 R_L = normalize(reflect(L0_dir, N));
	float dotVR = max(dot(V, R_L), 0.0);
	C_spec = pow(dotVR, cosine_power);
	
	float smoothness=sqr(texture2D(tex_smoothness,st_frag).x)*has_tex_smoothness+(1.0-has_tex_smoothness);
	vec4 C_tex=sqr(texture2D(tex_albedo,st_frag));
	vec3 C_brdf=vec3(incandescence)+(C_diff*diffuse+vec3(ambient_color))*C_tex.xyz+vec3(specular_color*smoothness)*(C_spec);
	vec3 C_refl=sampleEnv(R);
	return vec4(sqrt(C_brdf+(C_refl-C_brdf)*(fresnel(dotNV)*reflectivity*smoothness)),C_tex.w);
}
