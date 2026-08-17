from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    argument: str = Field(..., min_length=1, description="The argument text to analyze")


class NyayaSteps(BaseModel):
    pratijna: str = Field(..., description="Thesis (Pratijñā)")
    hetu: str = Field(..., description="Reason (Hetu)")
    udaharana: str = Field(..., description="Example (Udāharaṇa)")
    upanaya: str = Field(..., description="Application (Upanaya)")
    nigamana: str = Field(..., description="Conclusion (Nigamana)")


class AnalyzeResponse(BaseModel):
    validity: str
    steps: NyayaSteps
    fallacies: list[str]
    analyzer: str = Field(..., description="Which analyzer produced this result")
