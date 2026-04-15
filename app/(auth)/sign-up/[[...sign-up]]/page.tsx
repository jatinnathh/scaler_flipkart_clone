import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-flipkart-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-flipkart-primary italic">Flipkart</h1>
          <p className="text-flipkart-text-secondary mt-1">Create your Flipkart account</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg rounded-lg",
              headerTitle: "text-flipkart-text",
              formButtonPrimary: "bg-flipkart-primary hover:bg-flipkart-primary-dark",
            },
          }}
        />
      </div>
    </div>
  );
}
