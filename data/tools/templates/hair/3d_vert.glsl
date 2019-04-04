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

OUT_PARAM vec3 N_frag;
OUT_PARAM vec3 V_frag;
OUT_PARAM vec3 dPds_frag, dPdt_frag;
OUT_PARAM vec2 st_frag;
OUT_PARAM vec3 P_world_frag;

vec3 QuatTransformVector(vec4 Q,vec3 v){
	return v + 2.0*cross(Q.xyz, cross(Q.xyz,v) + Q.w*v);
}

void main(){
	vec3 P1=P*scales;

	P1 = (model_mat*vec4(P1,1.0)).xyz;

	P1.z=-P1.z;

	if(is_eye>0.5)
	{
		P1 = (mat_eye*vec4(P1,1.0)).xyz;
	}
	
	P1 = QuatTransformVector(quatR1,P1);

	if(isFlipH>0.5){
		P1.x = -P1.x;
	}
	
	P_world_frag = P1;
	vec4 modelPosition = (mat_view*vec4(P1,1.0));
	
	gl_Position=mat_proj*modelPosition;
	V_frag=normalize(modelPosition.xyz);

	vec3 N2 = QuatTransformVector(quatR1, N);
	if(isFlipH>0.5) {
		N_frag=normalize((mat_view*vec4(-N2.x,N2.y,-N2.z,0.0)).xyz);
		dPds_frag=normalize((mat_view*vec4(-dPds.x,dPds.y,-dPds.z,0.0)).xyz);
		dPdt_frag=normalize((mat_view*vec4(-dPdt.x,dPdt.y,-dPdt.z,0.0)).xyz);
	} else {
		N_frag=normalize((mat_view*vec4(N2.x,N2.y,-N2.z,0.0)).xyz);
		dPds_frag=normalize((mat_view*vec4(dPds.x,dPds.y,-dPds.z,0.0)).xyz);
		dPdt_frag=normalize((mat_view*vec4(dPdt.x,dPdt.y,-dPdt.z,0.0)).xyz);
	}
	st_frag=st;
}
