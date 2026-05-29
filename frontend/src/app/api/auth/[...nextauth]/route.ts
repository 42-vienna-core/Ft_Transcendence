'use server'

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Under the hood, Next.js handles your route.ts file like a mini-routing 
// controller. When you export GET and POST, you are giving Next.js's 
// engine two functions it can call when web requests hit /api/auth/*.

// This is a conceptual look at Next.js + NextAuth internal engine code

// 1. Next.js catches the request and routes it to your exported GET or POST
// export async function NextJsInternalRouteHandler(request) {
  
//   // 2. NextAuth extracts the URL path and HTTP method
//   const url = new URL(request.url);
//   const pathSegments = url.pathname.split('/'); 
//   const action = pathSegments[pathSegments.length - 1]; // e.g., "session", "signout", "credentials"
//   const method = request.method; // "GET" or "POST"

//   // 3. The Traffic Cop Engine parses the action
//   if (method === 'GET') {
//     switch (action) {
      
//       case 'session':
//         // Called by useSession()
//         const sessionCookie = request.cookies.get('next-auth.session-token');
//         if (!sessionCookie) return Response.json(null);
        
//         const decryptedToken = decryptAndVerify(sessionCookie, process.env.NEXTAUTH_SECRET);
//         return Response.json({
//           user: { id: decryptedToken.id, email: decryptedToken.email },
//           accessToken: decryptedToken.accessToken
//         });

//       case 'csrf':
//         // Generates a token to block cross-site request attacks
//         return Response.json({ csrfToken: generateSecureCsrfToken() });
//     }
//   }

//   if (method === 'POST') {
//     switch (action) {
      
//       case 'credentials': // Triggered by signIn('credentials')
//         const body = await request.json(); // Gets email & password
        
//         // NextAuth executes YOUR custom authorize() function here!
//         const user = await yourCustomAuthorizeConfig(body); 
        
//         if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

//         // Creates, encrypts, and sets the secure HttpOnly cookie
//         const encryptedCookie = encryptToken(user, process.env.NEXTAUTH_SECRET);
//         return Response.json({ success: true }, {
//           headers: { 'Set-Cookie': `next-auth.session-token=${encryptedCookie}; HttpOnly; Secure; Path=/` }
//         });

//       case 'signout':
//         // Deletes the cookie by setting its expiration date to the past
//         return Response.json({ success: true }, {
//           headers: { 'Set-Cookie': `next-auth.session-token=; Max-Age=0; Path=/` }
//         });
//     }
//   }
// }