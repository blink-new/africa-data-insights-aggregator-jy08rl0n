export interface UserVerification {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  isVerified: boolean;
  verificationCode?: string;
  createdAt: string;
  verifiedAt?: string;
}

export const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
  'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
  'Democratic Republic of the Congo', 'Republic of the Congo', 'Djibouti',
  'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia',
  'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast',
  'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi',
  'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia',
  'Niger', 'Nigeria', 'Rwanda', 'São Tomé and Príncipe', 'Senegal',
  'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
  'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
];

export const COUNTRY_PHONE_CODES = {
  'Algeria': '+213',
  'Angola': '+244',
  'Benin': '+229',
  'Botswana': '+267',
  'Burkina Faso': '+226',
  'Burundi': '+257',
  'Cameroon': '+237',
  'Cape Verde': '+238',
  'Central African Republic': '+236',
  'Chad': '+235',
  'Comoros': '+269',
  'Democratic Republic of the Congo': '+243',
  'Republic of the Congo': '+242',
  'Djibouti': '+253',
  'Egypt': '+20',
  'Equatorial Guinea': '+240',
  'Eritrea': '+291',
  'Eswatini': '+268',
  'Ethiopia': '+251',
  'Gabon': '+241',
  'Gambia': '+220',
  'Ghana': '+233',
  'Guinea': '+224',
  'Guinea-Bissau': '+245',
  'Ivory Coast': '+225',
  'Kenya': '+254',
  'Lesotho': '+266',
  'Liberia': '+231',
  'Libya': '+218',
  'Madagascar': '+261',
  'Malawi': '+265',
  'Mali': '+223',
  'Mauritania': '+222',
  'Mauritius': '+230',
  'Morocco': '+212',
  'Mozambique': '+258',
  'Namibia': '+264',
  'Niger': '+227',
  'Nigeria': '+234',
  'Rwanda': '+250',
  'São Tomé and Príncipe': '+239',
  'Senegal': '+221',
  'Seychelles': '+248',
  'Sierra Leone': '+232',
  'Somalia': '+252',
  'South Africa': '+27',
  'South Sudan': '+211',
  'Sudan': '+249',
  'Tanzania': '+255',
  'Togo': '+228',
  'Tunisia': '+216',
  'Uganda': '+256',
  'Zambia': '+260',
  'Zimbabwe': '+263'
};