varying vec3 N_frag,dPds_frag,dPdt_frag;
varying vec2 st_frag;
varying vec3 V_frag;

float selfDot(vec3 v){
	return v.x * v.x + v.y * v.y + v.z * v.z;
}

float _smoothstep(float a,float b,float x){
	if(x<=a)
		return 0.0;
	else if (x>=b)
		return 1.0;
	else
	{
		float y=(x-a)/(b-a);
		return y*y*(3.0-2.0*y);
	}
}

float _step(float a,float x){
	if(x<a)
		return 0.0;
	else
		return 1.0;
}

float sqr(float a){return a*a;}
vec3 sqr(vec3 a){return a*a;}
vec4 sqr(vec4 a){return vec4(sqr(a.rgb), a.a);}

vec4 shader_main(){
	vec3 N=-normalize(N_frag);
	/*if (selfDot(dPds_frag) > 0.0 && selfDot(dPdt_frag) > 0.0 && normal_strength > 0.0){
		vec3 nmmp=normalize(texture2D(tex_normal,st_frag).xyz-vec3(0.5));
		N+=(normalize(-nmmp.x*normalize(dPds_frag)-nmmp.y*normalize(dPdt_frag)+nmmp.z*N)-N)*normal_strength;
		N=normalize(N);	
	}*/

	vec4 C_tex=texture2D(tex_albedo,st_frag);
	vec3 albedo=albedocolor.rgb * C_tex.rgb;
	vec3 V=-normalize(V_frag),L;
	L=-L0_dir;
	float diff=dot(N,L);
	diff=diff * 0.5 + 0.5;
	vec3 diffuse0 = L0_color.rgb * albedo * texture2D(tex_ramp, vec2(diff, diff)).rgb;
	vec3 H=normalize(V+L);
	float spec=dot(N,H);
	float w=0.01;//fwidth(spec)*2.0;
	vec3 specular0 = speccolor.rgb * _smoothstep(-w, w, spec + specularscale - 1.0) * _step(0.0001, specularscale) * diff;

	L=-L1_dir;
	diff=dot(N,L);
	diff=diff * 0.5 + 0.5;
	vec3 diffuse1 = L1_color.rgb * albedo * texture2D(tex_ramp, vec2(diff, diff)).rgb;

	return vec4(diffuse0+specular0+diffuse1,1);
}
