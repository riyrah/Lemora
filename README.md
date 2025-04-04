This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## AI Features

This project includes AI-powered features:
- YouTube video summarization using Google Gemini API
- AI text humanizer to make AI-generated content sound more natural
- Flashcard generation from video content

## Getting Started

First, set up your environment variables:

1. Create a `.env.local` file with the following:
```
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Environment Variables

For the AI features to work in production, you must configure these environment variables in your hosting platform:

- `GOOGLE_API_KEY`: Your Google API key with Gemini API access
- `OPENAI_API_KEY`: Your OpenAI API key (if using OpenAI features)

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. During setup, add your environment variables
4. Deploy the application

The AI summarizer and other features should work automatically in the deployed version as long as the environment variables are properly configured.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
