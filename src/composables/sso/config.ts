
interface SSOApplication {
  url: string;
  application: string;
}



export const applications: { [key: string]: SSOApplication } = {
  hr_cares: {
    url: import.meta.env.VITE_SPA_SSO_URL,
    application: 'Human Resource Comprehensive Access to Records',
  },
}

export const serviceName = {
  get(app: string, redirectUrl: string) {
    const application = applications[app]

    if (!application) {
      return undefined
    }

    return {
      ...application,
      url: `${redirectUrl.replace(/\/$/, '')}/${application.url.replace(/^\//, '')}`,
    }
  },
}