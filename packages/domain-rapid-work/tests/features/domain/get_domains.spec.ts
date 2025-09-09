import { test } from "@japa/runner";

import {
  CreateDomainFeature,
} from "../../../core/rapid-work/features/domain/CreateDomainFeature";
import {
  GetDomainsFeature,
  GetDomainsParams,
} from "../../../core/rapid-work/features/domain/GetDomainsFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";

test.group("GetDomainsFeature", () => {
  test("should return domains for a user", async ({assert}) => {
    // Arrange
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const createDomainFeature = new CreateDomainFeature(mockDomainCollection, mockSubDomainCollection);
    const getDomainsFeature = new GetDomainsFeature(mockDomainCollection);

    // Create some domains for different users
    await createDomainFeature.execute({
      name: "Web Development",
      subDomains: [],
      userId: TEST_UUIDS.USER_1,
    });
    await createDomainFeature.execute({
      name: "Mobile Development",
      subDomains: [],
      userId: TEST_UUIDS.USER_1,
    });
    await createDomainFeature.execute({
      name: "Data Science",
      subDomains: [],
      userId: TEST_UUIDS.USER_2,
    });

    const params: GetDomainsParams = {
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await getDomainsFeature.execute(params);

    // Assert
    assert.lengthOf(result, 2);
    assert.equal(result[0].name.value, "Web Development");
    assert.equal(result[1].name.value, "Mobile Development");

    // Verify all domains belong to the right user
    result.forEach((domain) => {
      assert.equal(domain.userId.value, TEST_UUIDS.USER_1);
    });
  });

  test("should return empty array when user has no domains", async ({assert}) => {
    // Arrange
    const mockDomainCollection = new MockDomainCollection();
    const getDomainsFeature = new GetDomainsFeature(mockDomainCollection);
    const params: GetDomainsParams = {
      userId: TEST_UUIDS.NON_EXISTENT_USER,
    };

    // Act
    const result = await getDomainsFeature.execute(params);

    // Assert
    assert.lengthOf(result, 0);
  });
});
