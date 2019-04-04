//opengles 3.0
#ifdef GLSL3_shader
    #define OUT_PARAM out
    #define IN_PARAM in
    OUT_PARAM vec4 FragColor;
    #define gl_FragColor FragColor
#else
    #define OUT_PARAM varying
    #define IN_PARAM varying
#endif


// #define GL_ES
#if defined(GLSL3_shader)
	#define SAMPLER_2D texture
	#define SAMPLER_3D texture
	#define SAMPLER_CUBE texture

    #define TEXTURE_2D_LOD textureLod
    #define TEXTURE_CUBE_LOD textureLod
#elif defined(GL_ES)
	#define SAMPLER_2D texture2D
	#define SAMPLER_3D texture3D
	#define SAMPLER_CUBE textureCube

    #if defined(SUPPORT_EXT_TEXTURE_LOD)
        #define TEXTURE_2D_LOD texture2DLodEXT   
        #define TEXTURE_CUBE_LOD textureCubeLodEXT   
    #else 
        #define TEXTURE_2D_LOD texture2D
        #define TEXTURE_CUBE_LOD textureCube
    #endif
#else
	#define SAMPLER_2D texture
	#define SAMPLER_3D texture
	#define SAMPLER_CUBE texture

    #define TEXTURE_2D_LOD textureLod
    #define TEXTURE_CUBE_LOD textureLod
#endif

OUT_PARAM vec3 N_frag,dPds_frag,dPdt_frag;
OUT_PARAM vec2 st_frag;
OUT_PARAM vec3 V_frag;
OUT_PARAM vec4 world_pos;

vec3 QuatTransformVector(vec4 Q,vec3 v){
	return v + 2.0*cross(Q.xyz, cross(Q.xyz,v) + Q.w*v);
}

vec4 quaterionSlerp(vec4 p, vec4 q, float t){
	if(abs(p[0]-q[0])<0.00001 && abs(p[1]-q[1])<0.00001 && abs(p[2]-q[2])<0.00001 && abs(p[3]-q[3])<0.00001)return p;
	float theta = acos(dot(p,q));
	float ws = sin(theta);
	float w1 = sin((1.0 - t)*theta)/ws;
	float w2 = sin(t*theta)/ws;
	return normalize(w1*p + w2*q);
}

void main(){
	
	vec3 Ps=P*scales;
	if(isFlipH>0.5){
		Ps.x = -Ps.x-7.364/scale[0];
	}

	Ps = scale_e * Ps;

	//model transform
	Ps = (model_mat*vec4(Ps,1.0)).xyz; 
	Ps.z=-Ps.z;

	//weight transform
	if(0.5<obj_type&&obj_type<=0.75){
		vec4 head_quat;
		vec4 idq = vec4(0.0,0.0,0.0,1.0);
		
		head_quat = quaterionSlerp(idq,quatR1,1.0-weight);
		
		Ps -= weightOffset;
		Ps = QuatTransformVector(head_quat,Ps);
		Ps += weightOffset;

		vec4 Pf = vec4(Ps,1.0);
		gl_Position=mat_proj*(mat_cam*Pf);
	}else {
		vec4 Pf = vec4(Ps,1.0);
		gl_Position=mat_proj*(mat_view*Pf);
	}
	
	vec4 Pf = vec4(Ps,1.0);
	world_pos = Pf;
	V_frag=normalize((mat_view*Pf).xyz);

	vec4 Nf=model_mat*vec4(N.xyz,0.0);

	if(isFlipH>0.5){
		N_frag=normalize((mat_view*vec4(-Nf.x,Nf.y,-Nf.z,0.0)).xyz);
		dPds_frag=normalize((mat_view*vec4(-dPds.x,dPds.y,-dPds.z,0.0)).xyz);
		dPdt_frag=normalize((mat_view*vec4(-dPdt.x,dPdt.y,-dPdt.z,0.0)).xyz);
	}else{
		N_frag=normalize((mat_view*vec4(Nf.x,Nf.y,-Nf.z,0.0)).xyz);
		dPds_frag=normalize((mat_view*vec4(dPds.x,dPds.y,-dPds.z,0.0)).xyz);
		dPdt_frag=normalize((mat_view*vec4(dPdt.x,dPdt.y,-dPdt.z,0.0)).xyz);
	}
	st_frag=st;
	//st_frag.y = 1.0 - st_frag.y;
	//st_frag=lbrt.xy + (lbrt.zw-lbrt.xy)*st_frag;
	//st_frag.y = 1.0 - st_frag.y;
}
