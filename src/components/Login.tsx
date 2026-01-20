import React, { useState, useEffect } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    CardHeader,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { authAdminService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { UserRole } from "../constants/roles";

const Login: React.FC = () => {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, token, roles } = useAuth();

    useEffect(() => {
        // Only navigate if we have a valid token and not currently loading/submitting
        if (token && !loading) {
            // Check if there's a "from" location (user was redirected to login)
            const from = (location.state as any)?.from?.pathname;
            if (from && from !== '/login') {
                // If user tried to access a specific page, go there
                navigate(from, { replace: true });
            } else {
                // Otherwise, redirect based on highest priority role
                // console.log('🔀 [Redirect] Current roles:', roles);
                // console.log('🔀 [Redirect] UserRole.ADMIN:', UserRole.ADMIN);
                console.log('🔀 [Redirect] Has ADMIN role?', roles.includes(UserRole.ADMIN));

                if (roles.includes(UserRole.ADMIN)) {
                    //console.log('✅ [Redirect] Redirecting to /admin-application (Admin)');
                    navigate('/admin-dashboard', { replace: true });
                } else if (roles.includes(UserRole.MANAGER)) {
                    //console.log('✅ [Redirect] Redirecting to /admin-application (Manager)');
                    navigate('/admin-dashboard', { replace: true });
                } else if (roles.includes(UserRole.COUNTERSTAFF)) {
                    //console.log('✅ [Redirect] Redirecting to /admin-call (Counter Staff)');
                    navigate('/admin-dashboard', { replace: true });
                } else if (roles.includes(UserRole.USER)) {
                    //console.log('✅ [Redirect] Redirecting to /admin-call (User)');
                    navigate('/admin-dashboard', { replace: true });
                } else if (roles.includes(UserRole.VIEWER)) {
                    //console.log('✅ [Redirect] Redirecting to /admin-application (Viewer)');
                    navigate('/admin-dashboard', { replace: true });
                } else {
                    // Default fallback if no recognized role
                    //console.log('⚠️ [Redirect] No recognized role, redirecting to /admin-call (Default)');
                    navigate('/admin-dashboard', { replace: true });
                }
            }
        }
    }, [token, navigate, location.state, loading, roles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!username.trim() || !password.trim()) {
            setError("Please enter both username and password");
            setLoading(false);
            return;
        }

        try {
            const response = await authAdminService.login({ userName: username, password });
            // Only proceed with login if we got a valid response
            if (response && response.token && response.refreshToken && response.tokenExpiration) {
                login(response.userName, response.token, response.refreshToken, response.tokenExpiration);
                // Set loading to false so useEffect can navigate
                setLoading(false);
            } else {
                setError("Invalid response from server");
                setLoading(false);
            }
        } catch (err: any) {
            console.error("Sign in error:", err);

            // Extract meaningful error message
            let errorMessage = "Sign in failed";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data) {
                errorMessage = typeof err.response.data === 'string'
                    ? err.response.data
                    : "Invalid username or password";
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                minHeight: "100vh",
                minWidth: "100vw",
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    top: '-200px',
                    right: '-200px',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    bottom: '-150px',
                    left: '-150px',
                },
            }}
        >
            <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 }, position: 'relative', zIndex: 1 }}>
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        px: { xs: 3, sm: 5 },
                        py: 5,
                        bgcolor: "background.paper",
                        width: "100%",
                        maxWidth: 500,
                        transition: 'all 0.3s ease-in-out',
                        opacity: loading ? 0.95 : 1,
                        transform: loading ? 'scale(0.98)' : 'scale(1)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    {/* Logo/Icon */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 3,
                        }}
                    >
                        <Box
                            sx={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                width: 80,
                                height: 80,
                                borderRadius: '20px',
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                                transform: 'rotate(-5deg)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'rotate(0deg) scale(1.05)',
                                },
                            }}
                        >
                            <LockOutlinedIcon sx={{ color: "white", fontSize: 40 }} />
                        </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            textAlign: 'center',
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                        }}
                    >
                        Project Management
                    </Typography>
                    
                    <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{
                            textAlign: 'center',
                            mb: 4,
                            fontWeight: 500,
                        }}
                    >
                        Welcome back! Please sign in to continue
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                            <TextField
                                required
                                fullWidth
                                margin="normal"
                                label="User Name"
                                value={username}
                                onChange={(e) => {
                                    setUserName(e.target.value);
                                    if (error) setError(null);
                                }}
                                disabled={loading}
                                autoComplete="username"
                                autoFocus
                                error={!!error && !username.trim()}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutlineIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        transition: 'all 0.2s ease-in-out',
                                    }
                                }}
                            />
                            <TextField
                                required
                                fullWidth
                                margin="normal"
                                type={showPwd ? "text" : "password"}
                                label="Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError(null);
                                }}
                                disabled={loading}
                                autoComplete="current-password"
                                error={!!error && !password.trim()}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPwd((show) => !show)}
                                                edge="end"
                                                size="small"
                                                disabled={loading}
                                            >
                                                {showPwd ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        transition: 'all 0.2s ease-in-out',
                                    }
                                }}
                            />

                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mt: 2,
                                        animation: 'fadeIn 0.3s ease-in-out',
                                        '@keyframes fadeIn': {
                                            from: { opacity: 0, transform: 'translateY(-10px)' },
                                            to: { opacity: 1, transform: 'translateY(0)' },
                                        }
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading || !username.trim() || !password.trim()}
                                sx={{
                                    mt: 4,
                                    mb: 1,
                                    py: 1.8,
                                    fontWeight: 700,
                                    fontSize: "1.05rem",
                                    letterSpacing: 1.2,
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                                    borderRadius: 2,
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)',
                                    },
                                    '&:disabled': {
                                        background: 'rgba(0, 0, 0, 0.12)',
                                        boxShadow: 'none',
                                    },
                                }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={22} sx={{ mr: 1.5, color: 'white' }} />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </Box>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
