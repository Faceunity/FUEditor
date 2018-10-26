
//from Fabien Sangalard's DEngine
vec4 pack(float depth)
{
    const vec4 bitSh = vec4(256.0 * 256.0 * 256.0,
                            256.0 * 256.0,
                            256.0,
                            1.0);
    const vec4 bitMsk = vec4(0,
                             1.0 / 256.0,
                             1.0 / 256.0,
                             1.0 / 256.0);
    vec4 comp = fract(depth * bitSh);
    comp -= comp.xxyz * bitMsk;
    return comp * (256.0 / 255.0);
}

vec4 shader_main()
{
   return pack(gl_FragCoord.z);
   //return vec4(gl_FragCoord.z);
   //return vec4(1.0, 1.0 , 1.0, 0.0);
}
