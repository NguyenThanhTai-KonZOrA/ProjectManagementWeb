import { Chip } from "@mui/material";
import { Science as ScienceIcon, Cloud as CloudIcon } from "@mui/icons-material";

/**
 * Component hiển thị trạng thái Mock Data
 * Hiển thị ở góc phải trên màn hình khi đang sử dụng mock data
 */
export default function MockDataIndicator() {
    const useMockData = (window as any)._env_?.USE_MOCK_DATA === true;

    if (!useMockData) {
        return null; // Không hiển thị khi dùng API thật
    }

    return (
        <Chip
            icon={<ScienceIcon />}
            label="Mock Data Mode"
            color="warning"
            size="small"
            sx={{
                position: "fixed",
                top: 16,
                right: 16,
                zIndex: 9999,
                fontWeight: 600,
                boxShadow: 3,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                    "0%, 100%": {
                        opacity: 1,
                    },
                    "50%": {
                        opacity: 0.7,
                    },
                },
            }}
        />
    );
}

/**
 * Component badge nhỏ hơn để hiển thị trong header
 */
export function MockDataBadge() {
    const useMockData = (window as any)._env_?.USE_MOCK_DATA === true;

    return (
        <Chip
            icon={useMockData ? <ScienceIcon fontSize="small" /> : <CloudIcon fontSize="small" />}
            label={useMockData ? "Mock" : "API"}
            color={useMockData ? "warning" : "success"}
            size="small"
            variant="outlined"
            sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
            }}
        />
    );
}
