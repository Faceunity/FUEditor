varying vec3 N_frag;
varying vec3 dPds_frag;
varying vec3 dPdt_frag;
varying vec2 st_frag;
varying vec3 V_frag;

varying vec3 P_world_frag;
// tex_albedo
// tex_normal
// tex_specular

// ambient_color
// diffuse_color
// specular_color
// emission_color
// metalness
// roughness
// fresnel_info

float srgb_to_linear(float c)
{
	float lin = c <= 0.04045 ? c/12.92 : pow(((c+0.055)/1.055), 2.4);
    return lin;
}

vec3 srgb_to_linear(vec3 c)
{
	return vec3(srgb_to_linear(c.x), srgb_to_linear(c.y), srgb_to_linear(c.z));
}

float srgb_tolinear_fast(float c)
{
	return pow(c, 2.2);
}

vec3 srgb_tolinear_fast(vec3 c)
{
	return vec3(srgb_tolinear_fast(c.x), srgb_tolinear_fast(c.y), srgb_tolinear_fast(c.z));
}

float LinearToSrgbBranchingChannel(float lin) 
{
	if(lin < 0.00313067) return lin * 12.92;
	return pow(lin, (1.0/2.4)) * 1.055 - 0.055;
}

vec3 LinearToSrgbBranching(vec3 lin) 
{
	return vec3(
		LinearToSrgbBranchingChannel(lin.r),
		LinearToSrgbBranchingChannel(lin.g),
		LinearToSrgbBranchingChannel(lin.b));
}

vec3 LinearToSrgb(vec3 lin) 
{
	return LinearToSrgbBranching(lin);
}

float Saturate(float value)
{
	return clamp(value, 0.0, 1.0);
}

vec3 Saturate(vec3 value)
{
	return clamp(value, vec3(0.0,0.0,0.0), vec3(1.0,1.0,1.0));
}


#define PI     3.1415926535897932
#define INV_PI 0.3183098861837907

vec3 Diffuse_Lambert(vec3 diffuse_color)
{
	return diffuse_color * INV_PI;
}

vec3 Diffuse_Wrapped_Lambert(vec3 diffuse_color, float NoL, float w)
{
	//return diffuse_color * (1/PI) * Saturate((NoL + w) / ((1 + w) * (1 + w)));	
	return diffuse_color * INV_PI* Saturate((NoL + w) / (1.0 + w));	
}


float D_GGX(float roughness, float NdotH)
{
	float a = roughness * roughness;
	float a2 = a * a;
	float d = ( NdotH * a2 - NdotH ) * NdotH + 1.0;	// 2 mad
	return a2 / ( PI*d*d );							// 4 mul, 1 rcp
}

float Vis_SmithJointApprox(float roughness, float NoV, float NoL )
{
	float a = roughness * roughness;
	float Vis_SmithV = NoL * ( NoV * ( 1.0 - a ) + a );
	float Vis_SmithL = NoV * ( NoL * ( 1.0 - a ) + a );
	// Note: will generate NaNs with Roughness = 0.  MinRoughness is used to prevent this
	return 0.5 / ( Vis_SmithV + Vis_SmithL );
}


float Pow5( float x )
{
	float xx = x*x;
	return xx * xx * x;
}

vec3 Pow5( vec3 x )
{
	vec3 xx = x*x;
	return xx * xx * x;
}

vec3 F_Schlick(vec3 SpecularColor, float VoH )
{
	float Fc = Pow5(1.0 - VoH);					

	// Anything less than 2% is physically impossible and is instead considered to be shadowing
	return Saturate( 50.0 * SpecularColor.g ) * Fc + (1.0 - Fc) * SpecularColor;
}


vec3 StandardShading(vec3 diffuse_color,
					 vec3 specular_color,
					 float roughness,
					 vec3 N,
					 vec3 V,
					 vec3 L)
{
	float NoL = dot(N, L);
	float NoV = dot(N, V);
	float LoV = dot(L, V);

	vec3 H = normalize(V+L);
	//float InvLenH = 1.0 /sqrt( 2.0 + 2.0 * LoV );
	//float InvLenH = 1.0;
	//float NoH = Saturate( ( NoL + NoV ) * InvLenH );
	//float VoH = Saturate( InvLenH + InvLenH * LoV );

	float NoH = dot(N, H);
	float VoH = dot(V, H);

	NoL = Saturate(NoL);
	NoV = Saturate(abs(NoV) + 1e-5);

	// Generalized microfacet specular
	float D   = D_GGX(roughness, NoH );
	float Vis = Vis_SmithJointApprox(roughness, NoV, NoL);
	vec3  F   = F_Schlick(specular_color, VoH );

	//vec3  Diffuse = Diffuse_Lambert(diffuse_color) * NoL;
	//diffuse_color = vec3(1.0,1.0,1.0);
	vec3  Diffuse = Diffuse_Wrapped_Lambert(diffuse_color, NoL, diffuse_wrap);
	//vec3 Diffuse = Diffuse_Burley( DiffuseColor, LobeRoughness[1], NoV, NoL, VoH );
	//vec3 Diffuse = Diffuse_OrenNayar( DiffuseColor, LobeRoughness[1], NoV, NoL, VoH );

	vec3 Specular = (D * Vis) * F * NoL;

	return Diffuse + Specular;
	//return Diffuse;
}

vec3 rotate(vec3 v, float a)
{
	float angle =a*2.0*PI;
	float ca = cos(angle);
	float sa = sin(angle);
	return vec3(v.x*ca+v.z*sa, v.y, v.z*ca-v.x*sa);
}

// float hash(vec2 p)
// {
// 	const vec2 kMod2 = vec2(443.8975f, 397.2973f);
// 	p  = fract(p * kMod2);
// 	p += dot(p.xy, p.yx+19.19f);
// 	return fract(p.x * p.y);
// }

float unpack(vec4 color)
{
    const vec4 bitShifts = 255.0 / 256.0 * vec4(1.0 / (256.0 * 256.0 * 256.0),
                                                1.0 / (256.0 * 256.0),
                                                1.0 / 256.0,
                                                1);
    return dot(color, bitShifts);
}

float ShadowPCF(vec3 worldPosition, mat4 L_MVP, sampler2D shadowMap, float shadowMap_size, float samples, float step, float bias) 
{
    vec4 projPosition = L_MVP * vec4(worldPosition, 1.0);
    vec3 shadowPosition = projPosition.xyz / projPosition.w;
    shadowPosition = shadowPosition * 0.5 + 0.5;
    vec2 uv = shadowPosition.xy;
    float depth = shadowPosition.z - bias;

    float shadow = 0.0;
    float offset = (samples - 1.0) / 2.0;
    for (float x = -offset; x <= offset; x += 1.0) {
        for (float y = -offset; y <= offset; y += 1.0) {
            vec2 uv_ = uv + vec2(x, y) / shadowMap_size * step;
            vec4 packedDepth = texture2D(shadowMap, uv_);
            float depth_closest = unpack(packedDepth);
            //depth_closest = texture2D(shadowMap, uv_).r;
            shadow += (depth > depth_closest) ? 1.0 : 0.0;
        }
    }

    shadow /= samples * samples;
    return shadow;
}



vec3 IOSShading(vec3 N, vec3 V)
{
	// param from material
	// vec4 diffuseColor;
	// vec4 specularColor;
	// vec4 ambientColor;
	// vec4 emisisonColor;
	// vec4 selfIlluminationColor;
	// vec4 reflectiveColor;
	// vec4 multiplyColor;
	// vec4 transparentColor;
	// float  metalness;
	// float  roughness;
	// float  diffuseIntensity;
	// float  specularIntensity;
	// float  normalIntensity;
	// float  ambientIntensity;
	// float  emissionIntensity;
	// float  selfIlluminationIntensity;
	// float  reflectiveIntensity;
	// float  multiplyIntensity;
	// float  transparentIntensity;
	// float  metalnessIntensity;
	// float  roughnessIntensity;
	// float  materialShininess;
	// float  selfIlluminationOcclusion;
	// float  transparency;
	// vec3   fresnel; // x: ((n1-n2)/(n1+n2))^2 y:1-x z:exponent

    float ambient_occlusion = texture2D(tex_ao,st_frag).r;
	ambient_occlusion = Saturate(mix(1.0, ambient_occlusion, ao_intensity));

 	//vec4 ambient = ambient_color;

    vec4 diffuse = texture2D(tex_albedo, st_frag);
    diffuse.rgb = srgb_tolinear_fast(diffuse.rgb);
    diffuse.rgb *= diffuse_intensity;

    vec3 specular = texture2D(tex_specular, st_frag).rgb;    /// r = specular_intensity, g = roughness, b = specular_wrap
    specular.rgb = srgb_tolinear_fast(specular.rgb);
    //specular *= specular_intensity;   
    specular.r *= specular_intensity;   

    vec3 emission = texture2D(tex_emission, st_frag).rgb;
    emission.rgb = srgb_tolinear_fast(emission.rgb);
    vec3 orignal_ambient_color = emission;
    emission *= emission_intensity;

    // vec4 selfIllumination = texture2D(tex_selfillumination, st_frag);
    // selfIllumination *= selfillumination_intensity;

    // float multiply = texture2D(tex_multiply, st_frag);
    // multiply= mix(1.0, multiply, multiply_intensity);

    // vec4 transparent = texture2D(tex_transparent, st_frag);
    // transparent *= transparent_intensity;

    // vec3 refl = reflect( -V, N);
    // float m = 2.f * sqrt( refl.x*refl.x + refl.y*refl.y + (refl.z+1.0)*(refl.z+1.0));
    // reflective = texture2D(tex_reflective, vec2(vec2(refl.x,-refl.y) / m) + 0.5);
    // reflective *= reflective_intensity;

    //float fresnel = fresnel_f0 + (1.0 - fresnel_f0) * pow(1.f - Saturate(dot(V, N)), fresnel_exponent);
    //reflective *= fresnel;

    // standard blinn phong shading
    // Lighting
    vec3 light_contribut_ambient  = vec3(ambient_light_intensity,ambient_light_intensity,ambient_light_intensity);
    //vec3 light_contribut_ambient  = vec3(0.0, 0.0, 0.0);
    vec3 light_contribut_diffuse  = vec3(0.0, 0.0, 0.0);
    vec3 light_contribut_mul      = vec3(1.0, 1.0, 1.0);
    vec3 light_contribut_specular = vec3(0.0, 0.0, 0.0);
    
    vec3 light_color = L0_color;
    vec3 light_dir   = -L0_dir;

    float diffuse_coeff = Saturate(dot(N, light_dir) );
    //diffuse_coeff = pow(diffuse_coeff, diffuse_wrap + 1.0);
    diffuse_coeff = Saturate((dot(N, light_dir) + diffuse_wrap) / ((1.0 + diffuse_wrap)*(1.0 + diffuse_wrap)));	

    vec3 H = normalize(light_dir + V);

    float roughness = specular.g;

    float shininess = mix(material_shiness_max, material_shiness_min, roughness);
    float specular_coeff = max(dot(N, H), 0.0);
    specular_coeff = (shininess+2.0)/PI*pow(specular_coeff, shininess);
    specular_coeff *= specular.r;
    //specular_coeff = max(specular_coeff, 0.0);


	float shadow = ShadowPCF(P_world_frag, L0_MVP, tex_shadowMap0, SHADOWMAP_SIZE, 3.0, 1.0, bias);

    light_contribut_diffuse  = light_color * diffuse_coeff * (1.0 + diffuse_light_add) * (1.0 - shadow);
    //light_contribut_diffuse  = light_color * diffuse_coeff;
    light_contribut_specular = specular_coeff * light_color * (1.0 - shadow);


    vec3 color = vec3(0.0,0.0,0.0);
    
    vec3 D = light_contribut_diffuse * diffuse.rgb;
  	D += light_contribut_ambient * ambient_occlusion * orignal_ambient_color.rgb;

    color.rgb += D;

    vec3 S = light_contribut_specular;
    //S += reflective.rgb * ambient_occlusion;
    //S *= specular.rgb;
    color.rgb += S;

    color.rgb += emission.rgb;
    //color.rgb *= multiply.rgb;
    ///////////////////////////////////////
    

 //    if (enable_edge_dark > 0.5)
 //    {
 //    	//#ifdef USE_FRAGMENT_MODIFIER
	// 	// DoFragmentModifier START
	// 	float AO = ambient_occlusion;
	// 	float lightContrib = light_contribut_diffuse.r;
	// 	lightContrib *= AO;

	// 	float lightWrapMask = specular.b;

	// 	float fresnelBasis = Saturate(dot(V, N));
	// 	float fresnel = Saturate(pow(1.0-fresnelBasis , edgeDark_rimLight.w)) * pow(AO,5.0);

	// 	vec3 amb = emission.rgb;
	// 	color.rgb = mix(amb, vec3(1.0,1.0,1.0) , lightContrib);
	// 	float fresnelDarkening = Saturate(pow(1.0-fresnelBasis , edgeDark_rimLight.y)) * pow(AO,5.0);

	// 	//color.rgb = vec3(fresnelDarkening,fresnelDarkening,fresnelDarkening);

	// 	vec3 darkeningcolor = EdgesDarkeningColor.rgb;
	// 	color.rgb = mix(color.rgb, color.rgb * darkeningcolor, fresnelDarkening * lightWrapMask * edgeDark_rimLight.x);
	// 	color.rgb *= diffuse.rgb;
	// 	color += fresnel * lightWrapMask * edgeDark_rimLight.z;
	// 	color += light_contribut_specular * SpecularColor.rgb * AO;
	// 	//color += reflective.rgb * specular.r * AO;
	// //#endif
 //    }
	
	return color;
}

vec3 SHLighting(vec3 normal)
{
	// soft_1front_2back
	vec3 SHLight0 = vec3(11.022335, 11.022335, 11.022335);
	vec3 SHLight1 = vec3(4.517399, 4.517399, 4.517399);
	vec3 SHLight2 = vec3(0.050085, 0.050085, 0.050085);
	vec3 SHLight3 = vec3(-1.499147, -1.499147, -1.499147);
	vec3 SHLight4 = vec3(-1.097523, -1.097523, -1.097523);
	vec3 SHLight5 = vec3(0.009961, 0.009961, 0.009961);
	vec3 SHLight6 = vec3(-0.668798, -0.668798, -0.668798);
	vec3 SHLight7 = vec3(0.052228, 0.052228, 0.052228);
	vec3 SHLight8 = vec3(1.271947, 1.271947, 1.271947);

	// vec3 SHLight0 = vec3(6.117310, 6.117310, 6.117310);
	// vec3 SHLight1 = vec3(3.273197, 3.273197, 3.273197);
	// vec3 SHLight2 = vec3(-0.000006,-0.000006,-0.000006);
	// vec3 SHLight3 = vec3(-5.022103,-5.022103,-5.022103);
	// vec3 SHLight4 = vec3(-1.670648,-1.670648,-1.670648 );
	// vec3 SHLight5 = vec3(0.000005, 0.000005, 0.000005);
	// vec3 SHLight6 = vec3(-1.000932, -1.000932, -1.000932);
	// vec3 SHLight7 = vec3(-0.000000, -0.000000, -0.000000);
	// vec3 SHLight8 = vec3(0.700962, 0.700962, 0.700962);

	//l = 0 band
	vec3 d = SHLight0.xyz;

	//l = 1 band
	d += SHLight1.xyz * normal.y;
	d += SHLight2.xyz * normal.z;
	d += SHLight3.xyz * normal.x;

	//l = 2 band
	vec3 swz = normal.yyz * normal.xzx;
	d += SHLight4.xyz * swz.x;
	d += SHLight5.xyz * swz.y;
	d += SHLight7.xyz * swz.z;

	vec3 sqr = normal * normal;
	//d += SHLight6.xyz * ( 3.0*sqr.z - 1.0 );
	d += SHLight6.xyz * ( sqr.z );
	d += SHLight8.xyz * ( sqr.x - sqr.y );

 	d /= SHLight0.x;
	return d;
}

vec4 shader_main(){
	vec3 N=-normalize(N_frag);
	vec3 V=-normalize(V_frag);
	//vec3 L;

	vec4 base_color = texture2D(tex_albedo,st_frag);
	// float ao_map_value = texture2D(tex_ao,st_frag).r;
	// float ao = mix(1.0, ao_map_value, ao_intensity);

	// float smoothness = texture2D(tex_smoothness,st_frag).r;  // ao
	// float metallic = 0.0;

	// float linear_smoothness = srgb_tolinear_fast(smoothness);
	// float linear_roughness = 1.0 - linear_smoothness;
	// linear_roughness = mix(roughness, linear_roughness, has_tex_smoothness);

	// vec3 diffuse_color  = srgb_tolinear_fast(base_color.rgb);
	// //diffuse_color = vec3(1,1,1);

	// vec3 specular_color = vec3(0.04,0.04,0.04);

	vec3 final = vec3(0.0, 0.0, 0.0);

	//L = -L0_dir;
	//float NoL = Saturate(dot(N, L));
	//final += StandardShading(diffuse_color, specular_color, linear_roughness, N, V, L) * L0_color;

	// L=-L1_dir;
	// NoL = Saturate(dot(N, L));
	// final += StandardShading(diffuse_color, specular_color, linear_roughness, N, V, L) * L1_color * PI;

	//vec3 C_refl=sampleEnv(R);
	//return vec4(sqrt(C_brdf+(C_refl-C_brdf)*(fresnel(dotNV)*Kr*smoothness)),C_tex.w);

	//final += SHLighting(rotate(N, light_probe_rotate)) * light_probe_intensity * ao * diffuse_color;
	//final += light_probe_intensity * ao * diffuse_color;

	final = IOSShading(N, V);

	final = LinearToSrgb(final);
	return vec4(final,base_color.w);
}
