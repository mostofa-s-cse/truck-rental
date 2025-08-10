import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type DhakaArea = {
  placeId: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  address: string;
};

const dhakaAreas: DhakaArea[] = [
  { placeId: 'DHK-GULSHAN', name: 'Gulshan', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7890, longitude: 90.4152, address: 'Gulshan, Dhaka' },
  { placeId: 'DHK-BANANI', name: 'Banani', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7936, longitude: 90.4068, address: 'Banani, Dhaka' },
  { placeId: 'DHK-DHANMONDI', name: 'Dhanmondi', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7465, longitude: 90.3760, address: 'Dhanmondi, Dhaka' },
  { placeId: 'DHK-UTTARA', name: 'Uttara', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8747, longitude: 90.4006, address: 'Uttara, Dhaka' },
  { placeId: 'DHK-MIRPUR', name: 'Mirpur', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.3667, address: 'Mirpur, Dhaka' },
  { placeId: 'DHK-MOHAMMADPUR', name: 'Mohammadpur', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7586, longitude: 90.3580, address: 'Mohammadpur, Dhaka' },
  { placeId: 'DHK-TEJGAON', name: 'Tejgaon', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7639, longitude: 90.3929, address: 'Tejgaon, Dhaka' },
  { placeId: 'DHK-FARMGATE', name: 'Farmgate', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7564, longitude: 90.3890, address: 'Farmgate, Dhaka' },
  { placeId: 'DHK-PALTAN', name: 'Paltan', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7339, longitude: 90.4148, address: 'Paltan, Dhaka' },
  { placeId: 'DHK-RAMPURA', name: 'Rampura', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7631, longitude: 90.4255, address: 'Rampura, Dhaka' },
  { placeId: 'DHK-KHILGAON', name: 'Khilgaon', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7460, longitude: 90.4479, address: 'Khilgaon, Dhaka' },
  { placeId: 'DHK-MALIBAGH', name: 'Malibagh', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7526, longitude: 90.4233, address: 'Malibagh, Dhaka' },
  { placeId: 'DHK-WARI', name: 'Wari', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7112, longitude: 90.4196, address: 'Wari, Dhaka' },
  { placeId: 'DHK-JATRABARI', name: 'Jatrabari', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7104, longitude: 90.4545, address: 'Jatrabari, Dhaka' },
  { placeId: 'DHK-SHANTINAGAR', name: 'Shantinagar', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7372, longitude: 90.4134, address: 'Shantinagar, Dhaka' },
  { placeId: 'DHK-BANASREE', name: 'Banasree', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7630, longitude: 90.4492, address: 'Banasree, Dhaka' },
  { placeId: 'DHK-SHYAMOLI', name: 'Shyamoli', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7743, longitude: 90.3632, address: 'Shyamoli, Dhaka' },
  { placeId: 'DHK-KALLYANPUR', name: 'Kallyanpur', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7816, longitude: 90.3652, address: 'Kallyanpur, Dhaka' },
  { placeId: 'DHK-SAVAR', name: 'Savar', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8423, longitude: 90.2550, address: 'Savar, Dhaka' },
  { placeId: 'DHK-KAMALAPUR', name: 'Kamalapur', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7275, longitude: 90.4262, address: 'Kamalapur, Dhaka' },
  { placeId: 'DHK-MOTIJHEEL', name: 'Motijheel', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7321, longitude: 90.4181, address: 'Motijheel, Dhaka' },
  { placeId: 'DHK-BASHUNDHARA', name: 'Bashundhara R/A', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8151, longitude: 90.4480, address: 'Bashundhara Residential Area, Dhaka' },
  { placeId: 'DHK-BADDA', name: 'Badda', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7787, longitude: 90.4266, address: 'Badda, Dhaka' },
  { placeId: 'DHK-BARIDHARA', name: 'Baridhara', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8040, longitude: 90.4200, address: 'Baridhara, Dhaka' },
  { placeId: 'DHK-NIKETON', name: 'Nikunja/Niketon', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8302, longitude: 90.4208, address: 'Nikunja, Dhaka' },
  { placeId: 'DHK-TONGI', name: 'Tongi', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8947, longitude: 90.4020, address: 'Tongi, Dhaka' },
  { placeId: 'DHK-AIRPORT', name: 'Hazrat Shahjalal Int’l Airport', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8433, longitude: 90.3978, address: 'Airport, Dhaka' },
  // Additional areas requested
  { placeId: 'DHK-ABDULLAHPUR', name: 'Abdullahpur', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8826, longitude: 90.4043, address: 'Abdullahpur, Dhaka' },
  { placeId: 'DHK-BOCHILA', name: 'Bochila (Bosila)', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7432, longitude: 90.3532, address: 'Bochila, Mohammadpur, Dhaka' },
  { placeId: 'DHK-ADABOR', name: 'Adabor', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7733, longitude: 90.3606, address: 'Adabor, Dhaka' },
  { placeId: 'DHK-PALLABI', name: 'Pallabi', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8356, longitude: 90.3651, address: 'Pallabi, Dhaka' },
  { placeId: 'DHK-KAZIPARA', name: 'Kazipara', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7998, longitude: 90.3641, address: 'Kazipara, Mirpur, Dhaka' },
  { placeId: 'DHK-KAFRUL', name: 'Kafrul', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7945, longitude: 90.3804, address: 'Kafrul, Dhaka' },
  { placeId: 'DHK-AGARGAON', name: 'Agargaon', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7785, longitude: 90.3740, address: 'Agargaon, Dhaka' },
  { placeId: 'DHK-SHER-E-BANGLA-NAGAR', name: 'Sher-e-Bangla Nagar', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7772, longitude: 90.3780, address: 'Sher-e-Bangla Nagar, Dhaka' },
  { placeId: 'DHK-CANTONMENT', name: 'Cantonment Area', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8124, longitude: 90.3980, address: 'Dhaka Cantonment, Dhaka' },
  { placeId: 'DHK-NIKETAN', name: 'Niketan', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7807, longitude: 90.4149, address: 'Niketan, Gulshan, Dhaka' },
  { placeId: 'DHK-SHAHJADPUR', name: 'Shahjadpur', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7905, longitude: 90.4290, address: 'Shahjadpur, Dhaka' },
  { placeId: 'DHK-MOHAKHALI', name: 'Mohakhali', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7806, longitude: 90.4003, address: 'Mohakhali, Dhaka' },
  { placeId: 'DHK-AFTAB-NAGAR', name: 'Aftab Nagar', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7734, longitude: 90.4396, address: 'Aftab Nagar, Dhaka' },
  { placeId: 'DHK-UTTARKHAN', name: 'Uttarkhan', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.9027, longitude: 90.4415, address: 'Uttarkhan, Dhaka' },
  { placeId: 'DHK-DAKSHINKHAN', name: 'Dakshinkhan', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8895, longitude: 90.4173, address: 'Dakshinkhan, Dhaka' },
  { placeId: 'DHK-BAWNIA', name: 'Bawnia', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.9067, longitude: 90.4405, address: 'Bawnia, Dhaka' },
  { placeId: 'DHK-KHILKHET', name: 'Khilkhet', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8284, longitude: 90.4259, address: 'Khilkhet, Dhaka' },
  { placeId: 'DHK-SATARKUL', name: 'Satarkul', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8050, longitude: 90.4518, address: 'Satarkul, Dhaka' },
  { placeId: 'DHK-BERAID', name: 'Beraid', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8276, longitude: 90.4788, address: 'Beraid, Dhaka' },
  { placeId: 'DHK-VATARA', name: 'Vatara', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8090, longitude: 90.4383, address: 'Vatara, Dhaka' },
  { placeId: 'DHK-GABTALI', name: 'Gabtali', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7743, longitude: 90.3448, address: 'Gabtali, Dhaka' },
  { placeId: 'DHK-MIRPUR-1', name: 'Mirpur-1', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8046, longitude: 90.3650, address: 'Mirpur-1, Dhaka' },
  { placeId: 'DHK-MIRPUR-2', name: 'Mirpur-2', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8105, longitude: 90.3661, address: 'Mirpur-2, Dhaka' },
  { placeId: 'DHK-MIRPUR-3', name: 'Mirpur-3', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8120, longitude: 90.3630, address: 'Mirpur-3, Dhaka' },
  { placeId: 'DHK-MIRPUR-4', name: 'Mirpur-4', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8140, longitude: 90.3685, address: 'Mirpur-4, Dhaka' },
  { placeId: 'DHK-MIRPUR-5', name: 'Mirpur-5', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8160, longitude: 90.3705, address: 'Mirpur-5, Dhaka' },
  { placeId: 'DHK-MIRPUR-6', name: 'Mirpur-6', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8180, longitude: 90.3720, address: 'Mirpur-6, Dhaka' },
  { placeId: 'DHK-MIRPUR-7', name: 'Mirpur-7', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8200, longitude: 90.3740, address: 'Mirpur-7, Dhaka' },
  { placeId: 'DHK-MIRPUR-8', name: 'Mirpur-8', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8220, longitude: 90.3760, address: 'Mirpur-8, Dhaka' },
  { placeId: 'DHK-MIRPUR-9', name: 'Mirpur-9', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8240, longitude: 90.3780, address: 'Mirpur-9, Dhaka' },
  { placeId: 'DHK-MIRPUR-10', name: 'Mirpur-10', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8260, longitude: 90.3800, address: 'Mirpur-10, Dhaka' },
  { placeId: 'DHK-MIRPUR-11', name: 'Mirpur-11', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8280, longitude: 90.3820, address: 'Mirpur-11, Dhaka' },
  { placeId: 'DHK-MIRPUR-12', name: 'Mirpur-12', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8300, longitude: 90.3840, address: 'Mirpur-12, Dhaka' },
  { placeId: 'DHK-MIRPUR-13', name: 'Mirpur-13', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8320, longitude: 90.3860, address: 'Mirpur-13, Dhaka' },
  { placeId: 'DHK-MIRPUR-14', name: 'Mirpur-14', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8340, longitude: 90.3880, address: 'Mirpur-14, Dhaka' },
  { placeId: 'DHK-MIRPUR-15', name: 'Mirpur-15', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8360, longitude: 90.3900, address: 'Mirpur-15, Dhaka' },
  { placeId: 'DHK-GULSHAN-1', name: 'Gulshan-1', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7803, longitude: 90.4168, address: 'Gulshan-1, Dhaka' },
  { placeId: 'DHK-GULSHAN-2', name: 'Gulshan-2', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7916, longitude: 90.4145, address: 'Gulshan-2, Dhaka' },
  { placeId: 'DHK-BANANI-DOHS', name: 'Banani DOHS', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7882, longitude: 90.4008, address: 'Banani DOHS, Dhaka' },
  { placeId: 'DHK-MOHAKHALI-DOHS', name: 'Mohakhali DOHS', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.7801, longitude: 90.4022, address: 'Mohakhali DOHS, Dhaka' },
  { placeId: 'DHK-MIRPUR-DOHS', name: 'Mirpur DOHS', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8198, longitude: 90.3667, address: 'Mirpur DOHS, Dhaka' },
  { placeId: 'DHK-BARIDHARA-DOHS', name: 'Baridhara DOHS', city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', latitude: 23.8085, longitude: 90.4218, address: 'Baridhara DOHS, Dhaka' },
];

export async function seedDhakaAreas() {
  console.log('📍 Seeding Dhaka areas...');
  // Sort areas for predictable, serial order (e.g., Mirpur-1..15, Gulshan-1..2)
  const parseForSort = (name: string) => {
    const match = name.match(/^(.*?)[\-\s]?(\d+)$/i);
    if (match) {
      return { base: match[1].trim().toLowerCase(), num: parseInt(match[2], 10) };
    }
    return { base: name.toLowerCase(), num: Number.POSITIVE_INFINITY };
  };

  const sorted = [...dhakaAreas].sort((a, b) => {
    const A = parseForSort(a.name);
    const B = parseForSort(b.name);
    if (A.base === B.base) return A.num - B.num;
    return A.base.localeCompare(B.base);
  });

  for (const area of sorted) {
    await prisma.areaSearch.upsert({
      where: { placeId: area.placeId },
      update: {
        name: area.name,
        city: area.city,
        state: area.state,
        country: area.country,
        latitude: area.latitude,
        longitude: area.longitude,
        address: area.address,
        isActive: true,
      },
      create: {
        ...area,
        searchCount: 0,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${sorted.length} Dhaka areas`);
}


