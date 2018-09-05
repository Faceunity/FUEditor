varying vec3 N_frag;
varying vec2 st_frag;
varying vec3 V_frag;

void main(){
	vec3 Ps=P*scales;
	if(isFlipH>0.5){
		Ps.x = -Ps.x-7.364/scales[0];
	}
	
	Ps = (model_mat*vec4(Ps,1.0)).xyz;
	Ps.z=-Ps.z;
	
	vec4 modelPosition = (mat_view*vec4(Ps,1.0));
	
	gl_Position=mat_proj*modelPosition;
	V_frag=normalize(modelPosition.xyz);
	if(isFlipH>0.5)
		N_frag=normalize((mat_view*vec4(-N.x,N.y,-N.z,0.0)).xyz);
	else
		N_frag=normalize((mat_view*vec4(N.x,N.y,-N.z,0.0)).xyz);
	
	st_frag=st;
}
