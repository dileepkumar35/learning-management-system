import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ChevronRight from '@mui/icons-material/ChevronRight';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToApp from '@mui/icons-material/ExitToApp';
import { useAuth } from '../contexts/AuthContext';

// Styled components following GTL-MUI design patterns
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#232536',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const NavLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  lineHeight: 1.2,
  color: '#fff',
  marginLeft: theme.spacing(1.5),
  '&:hover': {
    color: '#ffda1b',
  },
}));

const MenuButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  textTransform: 'none',
  padding: theme.spacing(1, 1.5),
  borderRadius: '4px',
  fontSize: '0.95rem',
  fontWeight: 500,
  letterSpacing: '0.02em',
  position: 'relative',
  '&:hover': {
    color: '#ffda1b',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 0,
    height: '2px',
    backgroundColor: '#ffda1b',
    transition: 'all 0.3s ease',
  },
  '&:hover::after': {
    width: '80%',
    left: '10%',
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    backgroundColor: '#fafafa',
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#232536',
  color: '#fff',
  justifyContent: 'space-between',
  minHeight: '64px',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, level = 0 }) => ({
  padding: theme.spacing(1, 2, 1, 2 + level * 2),
  borderRadius: '4px',
  margin: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: 'rgba(35, 37, 54, 0.08)',
  },
  '&.active': {
    backgroundColor: 'rgba(255, 218, 27, 0.1)',
    borderLeft: '3px solid #ffda1b',
  },
}));

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, isInstructor, isStudent } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [submenuAnchor, setSubmenuAnchor] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // Menu configuration based on user role
  const getMenuItems = () => {
    const baseItems = [
      { text: 'Courses', path: '/courses', icon: <BookIcon /> },
    ];

    if (isStudent) {
      return [
        { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        ...baseItems,
        { text: 'My Progress', path: '/progress', icon: <TrendingUpIcon /> },
        { text: 'Certificates', path: '/certificates', icon: <EmojiEventsIcon /> },
      ];
    } else if (isInstructor) {
      return [
        { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        ...baseItems,
        { text: 'My Courses', path: '/instructor/courses', icon: <AssignmentIcon /> },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenu = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleCloseProfileMenu();
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
    closeSubmenu();
  };

  const toggleSubmenu = (text, event) => {
    if (isMobile) {
      setExpandedMenus({ ...expandedMenus, [text]: !expandedMenus[text] });
    } else {
      setSubmenuAnchor(event.currentTarget);
      setActiveSubmenu(activeSubmenu === text ? null : text);
    }
  };

  const closeSubmenu = () => {
    setSubmenuAnchor(null);
    setActiveSubmenu(null);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Desktop Menu Items
  const renderDesktopMenu = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
      {menuItems.map((item) =>
        item.submenu ? (
          <Box key={item.text} sx={{ position: 'relative' }}>
            <MenuButton
              endIcon={<ExpandMore />}
              onClick={(e) => toggleSubmenu(item.text, e)}
            >
              {item.text}
            </MenuButton>
            <Menu
              anchorEl={submenuAnchor}
              open={activeSubmenu === item.text}
              onClose={closeSubmenu}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                },
              }}
            >
              {item.submenu.map((subItem) => (
                <MenuItem
                  key={subItem.text}
                  onClick={() => {
                    handleNavigation(subItem.path);
                  }}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(35, 37, 54, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {subItem.icon}
                  </ListItemIcon>
                  <ListItemText>{subItem.text}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ) : (
          <MenuButton
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              color: isActivePath(item.path) ? '#ffda1b' : '#fff',
              fontWeight: isActivePath(item.path) ? 600 : 500,
            }}
          >
            {item.text}
          </MenuButton>
        )
      )}
    </Box>
  );

  // Mobile Drawer
  const renderMobileDrawer = () => (
    <StyledDrawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
    >
      <DrawerHeader>
        <NavLogo onClick={() => handleNavigation('/dashboard')}>
          <SchoolIcon sx={{ fontSize: 32, color: '#ffda1b' }} />
          <LogoText>LMS</LogoText>
        </NavLogo>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DrawerHeader>

      <Divider />

      {isAuthenticated && (
        <>
          <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#ffda1b',
                  color: '#232536',
                  fontWeight: 600,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isInstructor ? 'Instructor' : 'Student'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider />
        </>
      )}

      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <StyledListItemButton
              onClick={() =>
                item.submenu
                  ? toggleSubmenu(item.text)
                  : handleNavigation(item.path)
              }
              className={isActivePath(item.path) ? 'active' : ''}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#232536' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.submenu &&
                (expandedMenus[item.text] ? <ExpandLess /> : <ChevronRight />)}
            </StyledListItemButton>

            {item.submenu && (
              <Collapse in={expandedMenus[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <StyledListItemButton
                      key={subItem.text}
                      level={1}
                      onClick={() => handleNavigation(subItem.path)}
                      className={isActivePath(subItem.path) ? 'active' : ''}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: '#666' }}>
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText primary={subItem.text} />
                    </StyledListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}

        {!isAuthenticated && (
          <>
            <Divider sx={{ my: 2 }} />
            <StyledListItemButton onClick={() => handleNavigation('/login')}>
              <ListItemIcon sx={{ minWidth: 40, color: '#232536' }}>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </StyledListItemButton>
            <StyledListItemButton onClick={() => handleNavigation('/register')}>
              <ListItemIcon sx={{ minWidth: 40, color: '#232536' }}>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </StyledListItemButton>
          </>
        )}

        {isAuthenticated && (
          <>
            <Divider sx={{ my: 2 }} />
            <StyledListItemButton onClick={handleLogout}>
              <ListItemIcon sx={{ minWidth: 40, color: '#232536' }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </StyledListItemButton>
          </>
        )}
      </List>
    </StyledDrawer>
  );

  return (
    <>
      <StyledAppBar position="static">
        <Toolbar>
          {isMobile && isAuthenticated && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <NavLogo
            onClick={() => handleNavigation('/')}
            sx={{ flexGrow: { xs: 1, md: 0 } }}
          >
            <SchoolIcon sx={{ fontSize: 32, color: '#ffda1b' }} />
            <LogoText>LMS Platform</LogoText>
          </NavLogo>

          <Box sx={{ flexGrow: 1 }} />

          {renderDesktopMenu()}

          {isAuthenticated ? (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: 2 }}>
              <IconButton
                onClick={handleProfileMenu}
                sx={{ color: '#fff' }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: '#ffda1b',
                    color: '#232536',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleCloseProfileMenu}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToApp fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <MenuButton onClick={() => handleNavigation('/login')}>
                Login
              </MenuButton>
              <MenuButton onClick={() => handleNavigation('/register')}>
                Register
              </MenuButton>
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>

      {isMobile && renderMobileDrawer()}
    </>
  );
};

export default Navbar;
