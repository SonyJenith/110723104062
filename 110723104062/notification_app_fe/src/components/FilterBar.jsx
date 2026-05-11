import React from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { NOTIFICATION_TYPES } from '../utils/priorityHelper';

const FilterBar = ({ selectedTypes, onTypeChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTypeChange = (event, newTypes) => {
    // Allow empty selection (show all) or specific types
    onTypeChange(newTypes);
  };

  const types = Object.keys(NOTIFICATION_TYPES).sort();

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        backgroundColor: '#161b22',
        borderRadius: '8px',
        border: '1px solid #30363d',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          mb: 1.5,
          fontWeight: 600,
          color: '#79c0ff',
          textTransform: 'uppercase',
          fontSize: '0.8rem',
          letterSpacing: '0.5px',
        }}
      >
        Filter by Type
      </Typography>

      <ToggleButtonGroup
        value={selectedTypes}
        onChange={handleTypeChange}
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          '& .MuiToggleButton-root': {
            border: '1px solid #30363d',
            borderRadius: '6px',
            color: '#79c0ff',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            py: isMobile ? 0.75 : 1,
            px: isMobile ? 1.5 : 2,
            textTransform: 'none',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(121, 192, 255, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.2)',
              borderColor: '#1976d2',
              color: '#79c0ff',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.3)',
              },
            },
          },
        }}
      >
        {types.map((type) => (
          <ToggleButton key={type} value={type} aria-label={type}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: NOTIFICATION_TYPES[type].color,
                }}
              />
              {type}
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default FilterBar;
