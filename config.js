
module.exports = function callconfigs(types) {
  switch(types){

    case 'postgre':
      return "postgresql://neondb_owner:npg_qUTQ3o4esZjF@ep-sparkling-pond-apv9ip8u-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

    default:
      return null;
  }
};
