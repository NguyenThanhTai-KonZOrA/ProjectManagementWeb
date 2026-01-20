import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggleButton: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`} arrow>
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
        }}
      >
        <IconButton 
          onClick={toggleTheme} 
          color="inherit"
          sx={{
            position: 'relative',
            width: 48,
            height: 48,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'scale(1.1) rotate(15deg)',
              boxShadow: '0 8px 24px rgba(139, 154, 247, 0.3)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            '& .MuiSvgIcon-root': {
              transition: 'all 0.5s ease',
              animation: mode === 'light' ? 'rotate 0.5s ease' : 'none',
            },
            '@keyframes rotate': {
              '0%': {
                transform: 'rotate(0deg)',
              },
              '100%': {
                transform: 'rotate(360deg)',
              },
            },
          }}
        >
          {mode === 'light' ? (
            <Brightness4 
              sx={{ 
                fontSize: 24,
                color: '#fbbf24',
              }} 
            />
          ) : (
            <Brightness7 
              sx={{ 
                fontSize: 24,
                color: '#fbbf24',
                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))',
              }} 
            />
          )}
        </IconButton>
        
        {/* Animated ring effect on dark mode */}
        {mode === 'dark' && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              animation: 'pulse 2s infinite',
              pointerEvents: 'none',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                  transform: 'translate(-50%, -50%) scale(1)',
                },
                '50%': {
                  opacity: 0.5,
                  transform: 'translate(-50%, -50%) scale(1.1)',
                },
              },
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
};