export type IconsType = {
  tabBar: {
    [key: string]: {
      active: any;
      inactive: any;
    };
  };
  game: {
    [key: string]: any;
  };
  other: {
    [key: string]: any;
  };
};

export const icons = {
  // 底部导航栏图标
  tabBar: {
    news: {
      active: require('../../assets/icons/news_active.png'),
      inactive: require('../../assets/icons/news.png'),
    },
    profile: {
      active: require('../../assets/icons/profile_active.png'),
      inactive: require('../../assets/icons/profile.png'),
    },
    teams: {
      active: require('../../assets/icons/teams_active.png'),
      inactive: require('../../assets/icons/teams.png'),
    }
  },

  // 游戏相关图标
  game: {
    ball: require('../../assets/icons/ball.png'),
    field: require('../../assets/icons/field.png'),
    kickoff: require('../../assets/icons/kickoff.png'),
    shoot: require('../../assets/icons/shoot.png')
  }
} as const;

export default icons;
