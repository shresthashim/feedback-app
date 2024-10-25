import { Html, Head, Font, Preview, Heading, Row, Section, Text, Button, Container } from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html lang='en' dir='ltr'>
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily='Roboto'
          fallbackFontFamily='Verdana'
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle='normal'
        />
      </Head>
      <Preview>Your verification code: {otp}</Preview>

      <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", backgroundColor: "#f8f9fa" }}>
        <Section style={{ textAlign: "center", marginBottom: "30px" }}>
          <Heading as='h2' style={{ fontSize: "24px", color: "#333" }}>
            Hello {username},
          </Heading>
        </Section>

        <Section style={{ textAlign: "center", marginBottom: "20px" }}>
          <Text style={{ fontSize: "16px", color: "#555" }}>
            Thank you for registering! Please use the following verification code to complete your registration:
          </Text>
        </Section>

        <Section style={{ textAlign: "center", marginBottom: "30px" }}>
          <Text style={{ fontSize: "32px", fontWeight: "bold", color: "#333", letterSpacing: "4px" }}>{otp}</Text>
        </Section>

        <Section style={{ textAlign: "center", marginBottom: "20px" }}>
          <Text style={{ fontSize: "14px", color: "#888" }}>If you did not request this code, please ignore this email.</Text>
        </Section>

        <Section style={{ textAlign: "center", marginTop: "30px" }}>
          <Button
            href={`http://localhost:3000/verify/${username}`}
            style={{
              color: "#ffffff",
              backgroundColor: "#007bff",
              padding: "10px 20px",
              textDecoration: "none",
              borderRadius: "5px",
              fontSize: "16px",
            }}
          >
            Verify here
          </Button>
        </Section>
      </Container>
    </Html>
  );
}
