module.exports = function( obj ){
var __t,__p='';
__p+='\n\n#define SHADOW_COUNT '+
(obj.shadowCount)+
'\n\n';
 for(var i = 0; i<obj.shadowCount; i++){ 
__p+='\n  uniform sampler2D tShadowMap'+
(i)+
';\n';
 } 
__p+='\n\n\n\n\nuniform highp vec2 uShadowKernelRotation;\nuniform highp mat4 uShadowMatrices[SHADOW_COUNT];\nuniform highp vec4 uShadowTexelBiasVector[SHADOW_COUNT];\nuniform       vec2 uShadowMapSize[SHADOW_COUNT];\n\n\n// RGB depth decoding\n// ------------------\nhighp float decodeDepthRGB(highp vec3 rgb){\n  return(rgb.x+rgb.y*(1.0/255.0))+rgb.z*(1.0/65025.0);\n}\n\n\n\n#if depthFormat( D_RGB )\n  #define FETCH_DEPTH(t,uvs) decodeDepthRGB( texture2D(t,uvs).xyz )\n\n#elif depthFormat( D_DEPTH )\n  #define FETCH_DEPTH(t,uvs) texture2D(t,uvs).x\n\n#endif\n\n\n\n\n\n\nfloat resolveShadowNoFiltering(highp float fragZ, sampler2D depth,highp vec2 uv ){\n    return step( fragZ, FETCH_DEPTH( depth, uv.xy ) );\n}\n\n\nfloat resolveShadow2x1(highp float fragZ, sampler2D depth,highp vec2 uv, vec2 mapSize ){\n\n  highp float coordsPx = uv.x*mapSize.x;\n  highp float uvMin = floor( coordsPx ) * mapSize.y;\n  highp float uvMax = ceil(  coordsPx ) * mapSize.y;\n\n  vec2 occl = vec2(\n    FETCH_DEPTH( depth, vec2( uvMin, uv.y ) ),\n    FETCH_DEPTH( depth, vec2( uvMax, uv.y ) )\n  );\n\n  occl = step( vec2(fragZ), occl );\n\n  highp float ratio = coordsPx - uvMin*mapSize.x;\n  return ( ratio * occl.y + occl.x ) - ratio * occl.x;\n\n}\n\nfloat resolveShadow2x2(highp float fragZ, sampler2D depth,highp vec2 uv, vec2 mapSize ){\n\n  highp vec2 coordsPx = uv*mapSize.x;\n  highp vec2 uvMin=floor( coordsPx ) *mapSize.y;\n  highp vec2 uvMax=ceil(  coordsPx ) *mapSize.y;\n\n  vec4 occl = vec4(\n    FETCH_DEPTH( depth, uvMin ),\n    FETCH_DEPTH( depth, vec2(uvMax.x,uvMin.y) ),\n    FETCH_DEPTH( depth, vec2(uvMin.x,uvMax.y) ),\n    FETCH_DEPTH( depth, uvMax )\n  );\n\n  occl = step( vec4(fragZ), occl );\n\n  highp vec2 ratio = coordsPx - uvMin*mapSize.x;\n  vec2  t = ( ratio.y * occl.zw + occl.xy ) - ratio.y * occl.xy;\n\n  return(ratio.x*t.y+t.x)-ratio.x*t.x;\n}\n\n\nfloat calcLightOcclusions(sampler2D depth, highp vec3 fragCoord, vec2 mapSize ){\n  float s;\n\n  highp vec2 kernelOffset = uShadowKernelRotation * ( 4.0 / mapSize.x );\n\n  // NO FILTER\n  #if shadowFilter( PCFNONE )\n    s = resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy );\n\n\n  // PCF4x1\n  #elif shadowFilter( PCF4x1 )\n\n    s = resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy + kernelOffset                    );\n    s+= resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy - kernelOffset                    );\n    s+= resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy + vec2(-kernelOffset.y,kernelOffset.x)  );\n    s+= resolveShadowNoFiltering( fragCoord.z, depth, fragCoord.xy + vec2(kernelOffset.y,-kernelOffset.x)  );\n    s /= 4.0;\n\n  // PCF4x4\n  #elif shadowFilter( PCF4x4 )\n\n    s = resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + kernelOffset                        , mapSize );\n    s+=resolveShadow2x2( fragCoord.z, depth, fragCoord.xy - kernelOffset                         , mapSize );\n    s+=resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + vec2(-kernelOffset.y,kernelOffset.x) , mapSize );\n    s+=resolveShadow2x2( fragCoord.z, depth, fragCoord.xy + vec2(kernelOffset.y,-kernelOffset.x) , mapSize );\n    s /= 4.0;\n\n  // PCF2x2\n  #elif shadowFilter( PCF2x2 )\n\n    s = resolveShadow2x1( fragCoord.z, depth, fragCoord.xy + kernelOffset , mapSize);\n    s +=resolveShadow2x1( fragCoord.z, depth, fragCoord.xy - kernelOffset , mapSize);\n    s /= 2.0;\n\n  #endif\n\n  return s;\n\n}\n\n\n\nvec3 calcShadowPosition( vec4 texelBiasVector, mat4 shadowProjection, vec3 worldNormal, float invMapSize )\n{\n  float WoP = dot( texelBiasVector, vec4( vWorldPosition, 1.0 ) );\n\n  WoP *= .0005+2.0*invMapSize;\n\n  highp vec4 fragCoord = shadowProjection * vec4( vWorldPosition + WoP * worldNormal, 1.0);\n  return fragCoord.xyz / fragCoord.w;\n}\n\n\n';
return __p;
}