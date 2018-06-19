varying vec3 N_frag,dPds_frag,dPdt_frag;
varying vec2 st_frag;
varying vec3 V_frag;
   
float selfDot(vec3 v){
	return v.x * v.x + v.y * v.y + v.z * v.z;
}

float sqr(float a){return a*a;}
vec3 sqr(vec3 a){return a*a;}
vec4 sqr(vec4 a){return vec4(sqr(a.rgb), a.a);}

float fresnel(float c){
	float g=sqrt(max(ior*ior-1.0+c*c,0.0));
	return 0.5*sqr((g-c)/(g+c))*(1.0+sqr(c*(g+c)-1.0)/sqr(c*(g-c)+1.0));
}

float specular_TorranceSparrow(vec3 N, vec3 L, vec3 V, float k, float m)
{
	vec3 H = normalize(V + L);

	float dotNH = clamp(dot(N, H), 0.0, 1.0);
	float dotNV = clamp(dot(N, V), 0.0, 1.0);
	float dotHV = clamp(dot(H, V), 0.0, 1.0);
	float dotNL = clamp(dot(N, L), 0.0, 1.0);
	
	// D3
	float D, alpha;
	float k0 = m * m - 1.0;
	if((k0>-0.0001)&&(k0<0.0001))
		k0=0.0001;
	
	float k1 = 1.0 / k0;
	float k2 = k1 + 1.0;
	D = sqr(k2 / (dotNH * dotNH + k1));
	
	// G / dotNV
	float G;
	dotNH=2*dotNH;
	if(dotNV < dotNL)
	{
		if(dotNV == 0.0)
			dotNV = 0.01;
			
		if(2*dotNV*dotNH < dotHV)
			G = 2.0*dotNH/dotHV;
		else
			G = 1.0/dotNV;
	}
	else
	{
		if(dotNV == 0.0)
			dotNV = 0.01;
			
		if(2*dotNL*dotNH < dotHV)
			G = 2.0*dotNH*dotNL/(dotHV*dotNV);
		else
			G = 1.0/dotNV;
	}
	
	// F
	float F;
	dotHV=1.0-dotHV;
	dotHV=dotHV*dotHV*dotHV;
	F=dotHV+(1.0-dotHV)*k;
	
	return max(D*F*G, 0.0);
}

vec3 sampleEnv(vec3 R0){
	vec3 R=normalize(R0);
	float phi;
	if(abs(R.x)<abs(R.z)){
		phi=(3.1415926*0.5-atan(abs(R.x/R.z)));
	}else{
		phi=atan(abs(R.z/R.x));
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
	
	float m=eccentricity;
	float k=specular_roll_off;
	L=-L0_dir;
	C_spec=specular_TorranceSparrow(N, L, V, k, m);
	
	float smoothness=sqr(texture2D(tex_smoothness,st_frag).x)*has_tex_smoothness+(1.0-has_tex_smoothness);
	vec4 C_tex=sqr(texture2D(tex_albedo,st_frag));
	vec3 C_brdf=vec3(incandescence)+(C_diff*diffuse+vec3(ambient_color))*C_tex.xyz+vec3(specular_color*smoothness)*(C_spec);
	vec3 C_refl=sampleEnv(R);
	return vec4(sqrt(C_brdf+(C_refl-C_brdf)*(fresnel(dotNV)*reflectivity*smoothness)),C_tex.w);
}
