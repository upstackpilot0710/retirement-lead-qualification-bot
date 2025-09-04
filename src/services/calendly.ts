import axios from 'axios';

const CALENDLY_API_URL = 'https://api.calendly.com';
const CALENDLY_TOKEN = process.env.CALENDLY_API_TOKEN;

interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
}

interface SchedulingLink {
  uri: string;
  name: string;
  booking_url: string;
  owner: {
    name: string;
    email: string;
  };
}

export async function getUserInfo(): Promise<CalendlyUser> {
  try {
    const response = await axios.get(`${CALENDLY_API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${CALENDLY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.resource;
  } catch (error) {
    console.error('Calendly user info error:', error);
    throw error;
  }
}

export async function getSchedulingLinks(userUri: string): Promise<SchedulingLink[]> {
  try {
    const response = await axios.get(`${CALENDLY_API_URL}/scheduling_links`, {
      params: {
        user: userUri,
      },
      headers: {
        Authorization: `Bearer ${CALENDLY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.collection;
  } catch (error) {
    console.error('Calendly scheduling links error:', error);
    throw error;
  }
}

export async function getCalendlyBookingLink(): Promise<string> {
  try {
    const user = await getUserInfo();
    const links = await getSchedulingLinks(user.uri);

    // Return the first scheduling link, or the personal link
    if (links.length > 0) {
      return links[0].booking_url;
    }

    // Fallback to personal scheduling link
    return user.scheduling_url;
  } catch (error) {
    console.error('Error getting Calendly booking link:', error);
    // Return a generic Calendly username link as fallback
    return `https://calendly.com/${process.env.CALENDLY_USERNAME || 'john'}`;
  }
}

export async function createEventInvite(
  eventName: string,
  inviteesEmail: string[]
): Promise<any> {
  try {
    const response = await axios.post(
      `${CALENDLY_API_URL}/scheduled_events`,
      {
        event_name: eventName,
        invitees: inviteesEmail.map((email) => ({ email })),
      },
      {
        headers: {
          Authorization: `Bearer ${CALENDLY_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.resource;
  } catch (error) {
    console.error('Calendly event creation error:', error);
    throw error;
  }
}
