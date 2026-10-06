import { UserSession } from '../domain/model/user-session.entity';
import { SessionResource } from './auth.resource';

export class AuthAssembler {
  toSessionFromResource(r: SessionResource): UserSession {
    return new UserSession(r.token, r.email, r.businessName, r.businessType);
  }
}