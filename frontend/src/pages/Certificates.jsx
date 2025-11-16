import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  EmojiEvents,
  Verified,
  Download,
  Share,
  CheckCircle,
  Stars,
} from '@mui/icons-material';
import { certificatesAPI } from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  },
}));

const CertificateCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
  },
}));

const Certificates = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await certificatesAPI.getMyCertificates();
      setCertificates(response.data || []);
    } catch (err) {
      console.error('Error loading certificates:', err);
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCertificate = async () => {
    try {
      setError('');
      const response = await certificatesAPI.verify(verificationCode);
      setVerificationResult(response.data);
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setVerificationResult({
        verified: false,
        error: 'Invalid verification code'
      });
    }
  };

  const handleDownloadCertificate = (certificate) => {
    // This would generate and download a PDF certificate
    // For now, we'll just show an alert
    alert(`Certificate download for: ${certificate.course.title}\nCertificate ID: ${certificate.certificateId}`);
  };

  const handleShareCertificate = (certificate) => {
    // Copy verification link to clipboard
    const verificationUrl = `${window.location.origin}/verify/${certificate.certificateId}`;
    navigator.clipboard.writeText(verificationUrl);
    alert('Verification link copied to clipboard!');
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#232536', mb: 1 }}>
            My Certificates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your course completion certificates
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Verified />}
            onClick={() => setVerifyDialogOpen(true)}
            sx={{
              borderColor: '#232536',
              color: '#232536',
              '&:hover': {
                borderColor: '#ffda1b',
                backgroundColor: 'rgba(255, 218, 27, 0.1)',
              },
            }}
          >
            Verify Certificate
          </Button>
        </Box>

        {certificates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <EmojiEvents sx={{ fontSize: 100, color: '#e2e8f0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No certificates yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Complete courses to earn certificates
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/courses')}
              sx={{
                backgroundColor: '#ffda1b',
                color: '#232536',
                '&:hover': {
                  backgroundColor: '#232536',
                  color: '#fff',
                },
              }}
            >
              Browse Courses
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {certificates.map((certificate) => (
              <Grid item xs={12} md={6} key={certificate._id}>
                <CertificateCard>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmojiEvents sx={{ fontSize: 48, mr: 2 }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Certificate of Completion
                        </Typography>
                        <Chip
                          icon={<Verified />}
                          label="Verified"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            mt: 0.5,
                          }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {certificate.course.title}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Certificate ID: {certificate.certificateId}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Issued: {new Date(certificate.issuedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Completed: {new Date(certificate.completionDate).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {certificate.grade && (
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Stars sx={{ fontSize: 20 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Grade: {certificate.grade}%
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => handleDownloadCertificate(certificate)}
                        sx={{
                          backgroundColor: '#fff',
                          color: '#667eea',
                          '&:hover': {
                            backgroundColor: '#f9fafb',
                          },
                        }}
                      >
                        Download
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Share />}
                        onClick={() => handleShareCertificate(certificate)}
                        sx={{
                          borderColor: '#fff',
                          color: '#fff',
                          '&:hover': {
                            borderColor: '#fff',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        Share
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleViewCertificate(certificate)}
                        sx={{
                          borderColor: '#fff',
                          color: '#fff',
                          '&:hover': {
                            borderColor: '#fff',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        View
                      </Button>
                    </Box>
                  </Box>
                </CertificateCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Verify Certificate Dialog */}
        <Dialog
          open={verifyDialogOpen}
          onClose={() => {
            setVerifyDialogOpen(false);
            setVerificationCode('');
            setVerificationResult(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Verify Certificate</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the verification code to validate a certificate
            </Typography>

            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              sx={{ mb: 2 }}
            />

            {verificationResult && (
              <Alert
                severity={verificationResult.verified ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {verificationResult.verified ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Certificate Verified!
                    </Typography>
                    <Typography variant="body2">
                      Course: {verificationResult.certificate.course.title}
                    </Typography>
                    <Typography variant="body2">
                      Student: {verificationResult.certificate.student.name}
                    </Typography>
                    <Typography variant="body2">
                      Issued: {new Date(verificationResult.certificate.issuedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">
                    {verificationResult.error || 'Certificate verification failed'}
                  </Typography>
                )}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setVerifyDialogOpen(false);
                setVerificationCode('');
                setVerificationResult(null);
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleVerifyCertificate}
              disabled={!verificationCode}
              sx={{
                backgroundColor: '#ffda1b',
                color: '#232536',
                '&:hover': {
                  backgroundColor: '#232536',
                  color: '#fff',
                },
              }}
            >
              Verify
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Certificate Dialog */}
        <Dialog
          open={Boolean(selectedCertificate)}
          onClose={() => setSelectedCertificate(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedCertificate && (
            <>
              <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
                <EmojiEvents sx={{ fontSize: 60, color: '#ffda1b' }} />
              </DialogTitle>
              <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  Certificate of Completion
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  This certifies that
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#232536', mb: 3 }}>
                  {selectedCertificate.student.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  has successfully completed the course
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#667eea', mb: 4 }}>
                  {selectedCertificate.course.title}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  {selectedCertificate.grade && (
                    <Chip
                      icon={<CheckCircle />}
                      label={`Final Grade: ${selectedCertificate.grade}%`}
                      color="success"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <Chip
                    icon={<Verified />}
                    label="Verified"
                    color="primary"
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" color="text.secondary">
                    Certificate ID: {selectedCertificate.certificateId}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Verification Code: {selectedCertificate.verificationCode}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Date of Completion: {new Date(selectedCertificate.completionDate).toLocaleDateString()}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Date of Issue: {new Date(selectedCertificate.issuedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedCertificate(null)}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => handleDownloadCertificate(selectedCertificate)}
                  sx={{
                    backgroundColor: '#ffda1b',
                    color: '#232536',
                    '&:hover': {
                      backgroundColor: '#232536',
                      color: '#fff',
                    },
                  }}
                >
                  Download PDF
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default Certificates;
