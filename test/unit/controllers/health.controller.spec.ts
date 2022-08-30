import { setupApp } from '../../helpers/testapp';
import request from 'supertest';
import { Container } from "inversify";
import { It, Mock } from "moq.ts";
import { HealthController } from '../../../src/logion/controllers/health.controller';
import { AuthenticationService } from '../../../src/logion/services/authentication.service';
import { SyncPointRepository } from '../../../src/logion/model/syncpoint.model';
import { AuthorityService } from "../../../src/logion/services/authority.service";
import { NodeAuthorizationService } from "../../../src/logion/services/nodeauthorization.service";
import { NodeSignatureService } from '../../../src/logion/services/nodesignature.service';
import { ALICE } from '../../helpers/addresses';

describe('HealthController', () => {

    beforeEach(() => {
        process.env.HEALTH_TOKEN = EXPECTED_TOKEN;
        process.env.JWT_SECRET = "1c482e5368b84abe08e1a27d0670d303351989b3aa281cb1abfc2f48e4530b57";
        process.env.JWT_ISSUER = "12D3KooWDCuGU7WY3VaWjBS1E44x4EnmTgK3HRxWFqYG3dqXDfP1";
        process.env.JWT_TTL_SEC = "3600";
        process.env.OWNER = ALICE;
    })

    it('OK when authenticated and up', async () => {
        const app = setupApp(HealthController, container => bindMocks(container, true));

        await request(app)
            .get('/api/health')
            .set('Authorization', `Bearer ${EXPECTED_TOKEN}`)
            .expect(200);
    });

    it('Unauthorized with no token', async () => {
        const app = setupApp(HealthController, container => bindMocks(container, true));

        await request(app)
            .get('/api/health')
            .expect(401);
    })

    it('Unauthorized with unexpected token', async () => {
        const app = setupApp(HealthController, container => bindMocks(container, true));

        await request(app)
            .get('/api/health')
            .set('Authorization', `Bearer ${UNEXPECTED_TOKEN}`)
            .expect(401);
    })

    it('Unauthorized with undefined health check token', async () => {
        process.env.HEALTH_TOKEN = undefined;
        const app = setupApp(HealthController, container => bindMocks(container, true));

        await request(app)
            .get('/api/health')
            .set('Authorization', `Bearer ${EXPECTED_TOKEN}`)
            .expect(401);
    })

    it('Internal when authenticated and down', async () => {
        const app = setupApp(HealthController, container => bindMocks(container, false));

        await request(app)
            .get('/api/health')
            .set('Authorization', `Bearer ${EXPECTED_TOKEN}`)
            .expect(500);
    })
});

const EXPECTED_TOKEN = "the-health-check-token";

const UNEXPECTED_TOKEN = "wrong-health-check-token";

function bindMocks(container: Container, up: boolean): void {
    const authorityService = new Mock<AuthorityService>();
    const nodeAuthorizationService = new Mock<NodeAuthorizationService>()
    container.rebind(AuthenticationService)
        .toConstantValue(new AuthenticationService(authorityService.object(), nodeAuthorizationService.object(), new NodeSignatureService()));

    const syncPointRepository = new Mock<SyncPointRepository>();
    if(up) {
        syncPointRepository.setup(instance => instance.findByName(It.IsAny())).returns(Promise.resolve(null));
    } else {
        syncPointRepository.setup(instance => instance.findByName(It.IsAny())).throws(new Error("DB is down"));
    }
    container.bind(SyncPointRepository).toConstantValue(syncPointRepository.object());
}
